import { JSONType } from "@/data-structures";

/**
 * Represents the structure of table data with columns, row indices, and data values.
 *
 * @interface TableData
 * @property {string[]} columns - Array of column names/headers
 * @property {string[]} index - Array of row index identifiers
 * @property {JSONType[][]} data - 2D array where each inner array represents a row of data
 *
 * @example
 * ```typescript
 * const tableData: TableData = {
 *   columns: ["Name", "Age", "City"],
 *   index: ["row1", "row2", "row3"],
 *   data: [
 *     ["Alice", 25, "New York"],
 *     ["Bob", 30, "Los Angeles"],
 *     ["Charlie", 35, "Chicago"]
 *   ]
 * };
 * ```
 */
export interface TableData {
  columns: string[];
  index: string[];
  data: JSONType[][];
}

/**
 * Represents the transformed table data structure used internally by the component.
 * This structure combines the index column with the data columns for easier processing.
 *
 * @interface TransformedTableData
 * @property {string[]} header - Combined array of index column name and data column names
 * @property {JSONType[][]} rows - 2D array where each row includes the index value as the first element
 *
 * @example
 * ```typescript
 * const transformed: TransformedTableData = {
 *   header: ["index", "Name", "Age", "City"],
 *   rows: [
 *     ["row1", "Alice", 25, "New York"],
 *     ["row2", "Bob", 30, "Los Angeles"],
 *     ["row3", "Charlie", 35, "Chicago"]
 *   ]
 * };
 * ```
 */
export interface TransformedTableData {
  header: string[];
  rows: (JSONType | undefined)[][];
}

/**
 * Represents the direction of sorting for table columns.
 *
 * @typedef {string} SortDirection
 * @property {"asc"} asc - Ascending order (A-Z, 0-9)
 * @property {"desc"} desc - Descending order (Z-A, 9-0)
 */
export type SortDirection = "asc" | "desc";

/**
 * Function type for comparing two values during sorting operations.
 *
 * @typedef {function} ComparerFunction
 * @param {JSONType} a - First value to compare
 * @param {JSONType} b - Second value to compare
 * @returns {1 | -1 | 0} - Returns 1 if a > b, -1 if a < b, 0 if a === b
 *
 * @example
 * ```typescript
 * const numericComparator: ComparerFunction = (a, b) => {
 *   if (a < b) return -1;
 *   if (a > b) return 1;
 *   return 0;
 * };
 * ```
 */
export type ComparerFunction = (a: JSONType[], b: JSONType[]) => 1 | -1 | 0;

/**
 * Props interface for the SortableTable component.
 *
 * @interface SortableTableProps
 * @property {TableData} tabledata - The table data to display
 * @property {string} [className] - Additional CSS classes for styling
 * @property {"small" | "medium"} [size="small"] - Size of the table
 * @property {(column: string, direction: SortDirection) => void} [onSortChange] - Callback when sorting changes
 * @property {boolean} [enablePagination=false] - Enable pagination for large datasets
 * @property {number} [pageSize=50] - Number of rows per page when pagination is enabled
 * @property {boolean} [enableVirtualScrolling=false] - Enable virtual scrolling for performance
 * @property {number} [virtualScrollingHeight=400] - Height of virtual scrolling container
 * @property {boolean} [enableLazyLoading=false] - Enable lazy loading for infinite datasets
 * @property {(page: number) => Promise<void>} [onLoadMore] - Callback to load more data
 *
 * @example
 * ```typescript
 * <SortableTable
 *   tabledata={myData}
 *   enablePagination={true}
 *   pageSize={25}
 *   onSortChange={(column, direction) => console.log(`Sorting ${column} ${direction}`)}
 * />
 * ```
 */
export interface SortableTableProps {
  tabledata: TableData;
  className?: string;
  size?: "small" | "medium";
  onSortChange?: (column: string, direction: SortDirection) => void;
  // Performance options
  enablePagination?: boolean;
  pageSize?: number;
  enableVirtualScrolling?: boolean;
  virtualScrollingHeight?: number;
  enableLazyLoading?: boolean;
  onLoadMore?: (page: number) => Promise<void>;
}

/**
 * Represents the current state of pagination for the table.
 *
 * @interface PaginationState
 * @property {number} currentPage - Current page number (1-based)
 * @property {number} pageSize - Number of rows per page
 * @property {number} totalPages - Total number of pages
 * @property {number} totalRows - Total number of rows in the dataset
 *
 * @example
 * ```typescript
 * const pagination: PaginationState = {
 *   currentPage: 2,
 *   pageSize: 50,
 *   totalPages: 10,
 *   totalRows: 500
 * };
 * ```
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
}

/**
 * Configuration for virtual scrolling functionality.
 *
 * @interface VirtualScrollingConfig
 * @property {number} itemHeight - Height of each table row in pixels
 * @property {number} overscan - Number of items to render outside the visible area
 * @property {number} containerHeight - Height of the scrollable container
 *
 * @example
 * ```typescript
 * const virtualConfig: VirtualScrollingConfig = {
 *   itemHeight: 48,
 *   overscan: 5,
 *   containerHeight: 400
 * };
 * ```
 */
export interface VirtualScrollingConfig {
  itemHeight: number;
  overscan: number;
  containerHeight: number;
}
