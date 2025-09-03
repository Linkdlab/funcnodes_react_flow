import * as React from "react";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import {
  SortableTableProps,
  SortDirection,
  PaginationState,
  VirtualScrollingConfig,
} from "./types";
import {
  transformTableData,
  createComparator,
  sortTableData,
  sortTableDataChunked,
  calculatePagination,
  getPageData,
  calculateVisibleRange,
  debounce,
} from "./utils";
import "./SortableTable.scss";

/**
 * A high-performance, sortable table component with support for large datasets.
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Pagination for large datasets
 * - Virtual scrolling for smooth performance with thousands of rows
 * - Lazy loading for infinite data sets
 * - Responsive design with mobile support
 * - Accessibility with ARIA labels and keyboard navigation
 * - Performance optimizations for large datasets
 * - Themeable with CSS variables
 *
 * @component
 * @param {SortableTableProps} props - The component props
 * @returns {JSX.Element} The rendered table component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SortableTable tabledata={myData} />
 *
 * // With pagination for large datasets
 * <SortableTable
 *   tabledata={largeData}
 *   enablePagination={true}
 *   pageSize={50}
 * />
 *
 * // With virtual scrolling for very large datasets
 * <SortableTable
 *   tabledata={veryLargeData}
 *   enableVirtualScrolling={true}
 *   virtualScrollingHeight={400}
 * />
 * ```
 */
const SortableTable: React.FC<SortableTableProps> = ({
  tabledata,
  className = "",
  size = "small",
  onSortChange,
  enablePagination = undefined,
  pageSize = 50,
  enableVirtualScrolling = undefined,
  virtualScrollingHeight = 400,
  enableLazyLoading = undefined,
  onLoadMore,
}) => {
  // Handle undefined or null tabledata
  if (!tabledata) {
    tabledata = {
      columns: [],
      index: [],
      data: [],
    };
  }

  const table_length = tabledata.index.length;

  // implement:
  // 1. **Small tables (<100 rows)**: Use basic component
  // 2. **Medium tables (100-1000 rows)**: Enable pagination
  // 3. **Large tables (1000-10000 rows)**: Use pagination + virtual scrolling
  // 4. **Very large tables (>10000 rows)**: Use all features + lazy loading
  // if the values are undefined, then we should use the default values

  if (table_length > 10000) {
    enableLazyLoading =
      enableLazyLoading === undefined ? true : enableLazyLoading;
  }
  if (table_length > 1000) {
    enableVirtualScrolling =
      enableVirtualScrolling === undefined ? true : enableVirtualScrolling;
  }
  if (table_length > 2 * pageSize) {
    enablePagination = enablePagination === undefined ? true : enablePagination;
  }
  enableLazyLoading =
    enableLazyLoading === undefined ? false : enableLazyLoading;
  enableVirtualScrolling =
    enableVirtualScrolling === undefined ? false : enableVirtualScrolling;
  enablePagination = enablePagination === undefined ? false : enablePagination;

  // Transform table data with memoization
  const transformedTableData = useMemo(
    () => transformTableData(tabledata),
    [tabledata]
  );

  // State to manage the sorted column and direction
  const [orderDirection, setOrderDirection] = useState<SortDirection>("asc");
  const [orderBy, setOrderBy] = useState("index");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>(() =>
    calculatePagination(transformedTableData.rows.length, 1, pageSize)
  );

  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate order by index with fallback
  const orderByIndex = useMemo(() => {
    const index = transformedTableData.header.indexOf(orderBy);
    return index === -1 ? 0 : index;
  }, [transformedTableData.header, orderBy]);

  // Memoized sort handler with debouncing for large datasets
  const debouncedSort = useMemo(
    () =>
      debounce((column: string, direction: SortDirection) => {
        setOrderDirection(direction);
        setOrderBy(column);
        onSortChange?.(column, direction);
      }, 150),
    [onSortChange]
  );

  /**
   * Handles column sorting with performance optimizations.
   * For large datasets (>1000 rows), uses debounced sorting to prevent UI blocking.
   *
   * @param {string} column - The column name to sort by
   */
  const handleSort = useCallback(
    (column: string) => {
      const isAsc = orderBy === column && orderDirection === "asc";
      const newDirection: SortDirection = isAsc ? "desc" : "asc";

      // Use debounced sort for large datasets
      if (transformedTableData.rows.length > 1000) {
        debouncedSort(column, newDirection);
      } else {
        setOrderDirection(newDirection);
        setOrderBy(column);
        onSortChange?.(column, newDirection);
      }
    },
    [
      orderBy,
      orderDirection,
      onSortChange,
      transformedTableData.rows.length,
      debouncedSort,
    ]
  );

  // Memoized comparator
  const comparator = useMemo(
    () => createComparator(orderDirection, orderByIndex),
    [orderDirection, orderByIndex]
  );

  // Sort the rows with performance optimization for large datasets
  const sortedRows = useMemo(() => {
    if (transformedTableData.rows.length > 1000) {
      return sortTableDataChunked(transformedTableData.rows, comparator);
    }
    return sortTableData(transformedTableData.rows, comparator);
  }, [transformedTableData.rows, comparator]);

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!enablePagination) return sortedRows;
    return getPageData(sortedRows, pagination.currentPage, pagination.pageSize);
  }, [
    sortedRows,
    enablePagination,
    pagination.currentPage,
    pagination.pageSize,
  ]);

  // Virtual scrolling calculations
  const virtualConfig: VirtualScrollingConfig = {
    itemHeight: 48, // Approximate row height
    overscan: 5,
    containerHeight: virtualScrollingHeight,
  };

  const visibleRange = useMemo(() => {
    if (!enableVirtualScrolling)
      return { startIndex: 0, endIndex: currentPageData.length - 1 };
    return calculateVisibleRange(
      scrollTop,
      virtualConfig.containerHeight,
      virtualConfig.itemHeight,
      currentPageData.length,
      virtualConfig.overscan
    );
  }, [
    scrollTop,
    enableVirtualScrolling,
    currentPageData.length,
    virtualConfig,
  ]);

  /**
   * Handles scroll events for virtual scrolling.
   * Updates the scroll position to calculate which rows should be rendered.
   *
   * @param {React.UIEvent<HTMLDivElement>} event - The scroll event
   */
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!enableVirtualScrolling) return;
      setScrollTop(event.currentTarget.scrollTop);
    },
    [enableVirtualScrolling]
  );

  /**
   * Handles pagination changes.
   * Updates the current page and triggers re-render with new page data.
   *
   * @param {number} newPage - The new page number
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  }, []);

  /**
   * Handles keyboard navigation for accessibility.
   * Supports arrow keys for pagination and Enter/Space for sorting.
   *
   * @param {React.KeyboardEvent<HTMLDivElement>} event - The keyboard event
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enablePagination) return;

      // Check if the event target is within the table (not from child components)
      const target = event.target as HTMLElement;
      const tableWrapper = target.closest(".sortable-table-wrapper");
      const isTableFocused = tableWrapper === event.currentTarget;

      // Only handle keyboard events if they originate from within this table instance
      if (!isTableFocused) return;

      switch (event.key) {
        case "ArrowLeft":
          if (pagination.currentPage > 1) {
            event.preventDefault();
            event.stopPropagation(); // Prevent event from bubbling up to dialog
            handlePageChange(pagination.currentPage - 1);
          }
          break;
        case "ArrowRight":
          if (pagination.currentPage < pagination.totalPages) {
            event.preventDefault();
            event.stopPropagation(); // Prevent event from bubbling up to dialog
            handlePageChange(pagination.currentPage + 1);
          }
          break;
        case "Home":
          if (pagination.currentPage > 1) {
            event.preventDefault();
            event.stopPropagation(); // Prevent event from bubbling up to dialog
            handlePageChange(1);
          }
          break;
        case "End":
          if (pagination.currentPage < pagination.totalPages) {
            event.preventDefault();
            event.stopPropagation(); // Prevent event from bubbling up to dialog
            handlePageChange(pagination.totalPages);
          }
          break;
      }
    },
    [
      enablePagination,
      pagination.currentPage,
      pagination.totalPages,
      handlePageChange,
    ]
  );

  // Update pagination when data changes
  useEffect(() => {
    if (enablePagination) {
      setPagination((prev) => {
        const newPagination = calculatePagination(
          sortedRows.length,
          prev.currentPage, // Use previous current page instead of hardcoding 1
          pageSize
        );
        return newPagination;
      });
    }
  }, [sortedRows.length, enablePagination, pageSize]);

  // Lazy loading effect
  useEffect(() => {
    if (
      enableLazyLoading &&
      onLoadMore &&
      pagination.currentPage >= pagination.totalPages - 1
    ) {
      onLoadMore(pagination.currentPage + 1);
    }
  }, [
    enableLazyLoading,
    onLoadMore,
    pagination.currentPage,
    pagination.totalPages,
  ]);

  /**
   * Renders pagination controls.
   * Shows previous/next buttons and current page information.
   *
   * @returns {JSX.Element | null} The pagination controls or null if disabled
   */
  const renderPagination = () => {
    if (!enablePagination) return null;

    return (
      <div className="sortable-table-pagination">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages}(
          {pagination.totalRows} total rows)
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  /**
   * Renders the table body with virtual scrolling support.
   * For virtual scrolling, only renders visible rows plus overscan area.
   * Adds spacer rows to maintain proper scroll height.
   *
   * @returns {JSX.Element} The table body with appropriate rows
   */
  const renderTableBody = () => {
    const rowsToRender = enableVirtualScrolling
      ? currentPageData.slice(
          visibleRange.startIndex,
          visibleRange.endIndex + 1
        )
      : currentPageData;

    return (
      <TableBody>
        {enableVirtualScrolling && (
          <TableRow
            style={{
              height: visibleRange.startIndex * virtualConfig.itemHeight,
            }}
          >
            <TableCell colSpan={transformedTableData.header.length} />
          </TableRow>
        )}
        {rowsToRender.map((row, index) => {
          const actualIndex = enableVirtualScrolling
            ? visibleRange.startIndex + index
            : index;
          return (
            <TableRow key={tabledata.index?.[actualIndex] || actualIndex}>
              {row.map((cell, i) => (
                <TableCell
                  key={`${tabledata.index?.[actualIndex] || actualIndex}-${i}`}
                  className={
                    i === 0
                      ? "sortable-table-index-cell"
                      : "sortable-table-data-cell"
                  }
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
        {enableVirtualScrolling && (
          <TableRow
            style={{
              height:
                (currentPageData.length - visibleRange.endIndex - 1) *
                virtualConfig.itemHeight,
            }}
          >
            <TableCell colSpan={transformedTableData.header.length} />
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <div
      className="sortable-table-wrapper"
      onKeyDown={handleKeyDown}
      tabIndex={enablePagination ? 0 : -1}
      role={enablePagination ? "application" : undefined}
      aria-label={
        enablePagination ? "Sortable table with pagination" : undefined
      }
    >
      <TableContainer
        className={`sortable-table-container ${className}`}
        ref={containerRef}
        onScroll={handleScroll}
        style={
          enableVirtualScrolling
            ? { height: virtualScrollingHeight }
            : undefined
        }
      >
        <Table size={size as "small" | "medium"}>
          <TableHead className="sortable-table-head">
            <TableRow className="sortable-table-header-row">
              {transformedTableData.header.map((column) => (
                <TableCell
                  key={column}
                  className="sortable-table-header-cell"
                  aria-label={`Sort by ${column}`}
                >
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? orderDirection : "asc"}
                    onClick={() => handleSort(column)}
                    className="sortable-table-sort-label"
                    sx={{
                      "& .MuiTableSortLabel-icon": {
                        color: "inherit !important",
                      },
                    }}
                  >
                    {column}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {renderTableBody()}
        </Table>
      </TableContainer>
      {renderPagination()}
    </div>
  );
};

SortableTable.displayName = "SortableTable";

export default SortableTable;
