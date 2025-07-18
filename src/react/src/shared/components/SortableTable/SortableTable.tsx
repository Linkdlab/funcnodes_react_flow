import * as React from "react";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody,
} from "../../../frontend/assets/mui";
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
const SortableTable: React.FC<SortableTableProps> = React.memo(
  ({
    tabledata,
    className = "",
    size = "small",
    onSortChange,
    enablePagination = false,
    pageSize = 50,
    enableVirtualScrolling = false,
    virtualScrollingHeight = 400,
    enableLazyLoading = false,
    onLoadMore,
  }) => {
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
      return getPageData(
        sortedRows,
        pagination.currentPage,
        pagination.pageSize
      );
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

    // Update pagination when data changes
    useEffect(() => {
      if (enablePagination) {
        setPagination((prev) =>
          calculatePagination(sortedRows.length, 1, pageSize)
        );
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
                    key={`${
                      tabledata.index?.[actualIndex] || actualIndex
                    }-${i}`}
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
      <div className="sortable-table-wrapper">
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
                    sortDirection={orderBy === column ? orderDirection : false}
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
  }
);

SortableTable.displayName = "SortableTable";

export default SortableTable;
