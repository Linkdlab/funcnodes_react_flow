import { JSONType } from "@/data-structures";
import {
  TableData,
  TransformedTableData,
  SortDirection,
  ComparerFunction,
  PaginationState,
} from "./types";

/**
 * Transforms raw table data into a format suitable for rendering.
 * Handles edge cases like undefined data, missing columns, and missing indices.
 *
 * @param {TableData} data - The raw table data to transform
 * @returns {TransformedTableData} The transformed data with combined headers and rows
 *
 * @example
 * ```typescript
 * const rawData: TableData = {
 *   columns: ["Name", "Age"],
 *   index: ["row1", "row2"],
 *   data: [["Alice", 25], ["Bob", 30]]
 * };
 *
 * const transformed = transformTableData(rawData);
 * // Result: {
 * //   header: ["index", "Name", "Age"],
 * //   rows: [["row1", "Alice", 25], ["row2", "Bob", 30]]
 * // }
 * ```
 */
export const transformTableData = (data: TableData): TransformedTableData => {
  const rows = [];
  if (data === undefined) {
    // return empty table if data is undefined
    return {
      header: [],
      rows: [],
    };
  }
  if (data.data === undefined) {
    // if data.data is undefined, make it empty
    data.data = [];
  }

  if (data.columns === undefined || data.columns.length === 0) {
    // if no columns are defined or columns array is empty, create columns based on the first row

    // if data is empty, there are no columns
    if (data.data.length === 0) {
      data.columns = [];
    } else {
      // create columns based on the first row
      data.columns = data.data[0].map((_, i) => `col${i}`);
    }
  }
  if (data.index === undefined || data.index.length === 0) {
    // if no index is defined or index array is empty, create index based on the number of rows
    data.index = data.data.map((_, i) => `row${i}`);
  }

  const maxRows = Math.max(data.index.length, data.data.length);
  for (let i = 0; i < maxRows; i++) {
    const indexValue = i < data.index.length ? data.index[i] : `row${i}`;
    const row: (JSONType | undefined)[] = [indexValue];
    for (let j = 0; j < data.columns.length; j++) {
      row.push(data.data[i] ? data.data[i][j] : undefined);
    }
    rows.push(row);
  }
  return {
    header: ["index", ...data.columns],
    rows: rows,
  };
};

/**
 * Creates a comparator function for sorting table data.
 * The comparator compares values at the specified column index.
 *
 * @param {SortDirection} order - The sort direction ("asc" or "desc")
 * @param {number} orderByIndex - The index of the column to sort by
 * @returns {ComparerFunction} A function that compares two rows based on the specified column
 *
 * @example
 * ```typescript
 * const ascendingComparator = createComparator("asc", 1); // Sort by second column ascending
 * const descendingComparator = createComparator("desc", 0); // Sort by first column descending
 * ```
 */
export const createComparator = (
  order: SortDirection,
  orderByIndex: number
): ComparerFunction => {
  return order === "desc"
    ? (a, b) => {
        if (b[orderByIndex]! < a[orderByIndex]!) return -1;
        if (b[orderByIndex]! > a[orderByIndex]!) return 1;
        return 0;
      }
    : (a, b) => {
        if (a[orderByIndex]! < b[orderByIndex]!) return -1;
        if (a[orderByIndex]! > b[orderByIndex]!) return 1;
        return 0;
      };
};

/**
 * Sorts table data using the provided comparator function.
 * Uses a stable sorting algorithm that preserves the original order of equal elements.
 *
 * @param {any[][]} data - The table data to sort (array of rows)
 * @param {ComparerFunction} comparator - Function to compare two rows
 * @returns {any[][]} The sorted table data
 *
 * @example
 * ```typescript
 * const data = [["row1", "Alice", 25], ["row2", "Bob", 30]];
 * const comparator = createComparator("asc", 2); // Sort by age
 * const sorted = sortTableData(data, comparator);
 * ```
 */
export const sortTableData = (
  data: any[][],
  comparator: ComparerFunction
): any[][] => {
  const stabilizedThis: [any[], number][] = data.map((el, index) => [
    el,
    index,
  ]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order;
  });
  return stabilizedThis.map((el) => el[0]);
};

/**
 * Sorts large datasets in chunks to avoid blocking the main thread.
 * For datasets larger than the chunk size, this function splits the data into chunks,
 * sorts each chunk individually, then merges the sorted chunks.
 *
 * @param {any[][]} data - The table data to sort
 * @param {ComparerFunction} comparator - Function to compare two rows
 * @param {number} [chunkSize=1000] - Size of each chunk for processing
 * @returns {any[][]} The sorted table data
 *
 * @example
 * ```typescript
 * const largeDataset = generateLargeDataset(10000);
 * const comparator = createComparator("asc", 1);
 * const sorted = sortTableDataChunked(largeDataset, comparator, 500);
 * ```
 */
export const sortTableDataChunked = (
  data: any[][],
  comparator: ComparerFunction,
  chunkSize: number = 1000
): any[][] => {
  if (data.length <= chunkSize) {
    return sortTableData(data, comparator);
  }

  // Sort in chunks to avoid blocking the main thread
  const chunks: any[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  // Sort each chunk
  const sortedChunks = chunks.map((chunk) => sortTableData(chunk, comparator));

  // Merge sorted chunks
  return mergeSortedChunks(sortedChunks, comparator);
};

/**
 * Merges multiple sorted arrays into a single sorted array.
 * Uses a k-way merge algorithm to efficiently combine sorted chunks.
 *
 * @param {any[][][]} chunks - Array of sorted chunks to merge
 * @param {ComparerFunction} comparator - Function to compare two rows
 * @returns {any[][]} The merged and sorted data
 *
 * @example
 * ```typescript
 * const chunk1 = [["row1", "Alice", 25], ["row2", "Bob", 30]];
 * const chunk2 = [["row3", "Charlie", 35], ["row4", "David", 40]];
 * const merged = mergeSortedChunks([chunk1, chunk2], comparator);
 * ```
 */
const mergeSortedChunks = (
  chunks: any[][][],
  comparator: ComparerFunction
): any[][] => {
  if (chunks.length === 1) return chunks[0];

  const result: any[][] = [];
  const indices = new Array(chunks.length).fill(0);

  while (indices.some((index, i) => index < chunks[i].length)) {
    let minChunkIndex = -1;
    let minValue: any[] | null = null;

    // Find the minimum value across all chunks
    for (let i = 0; i < chunks.length; i++) {
      if (indices[i] < chunks[i].length) {
        const currentValue = chunks[i][indices[i]];
        if (minValue === null || comparator(currentValue, minValue) < 0) {
          minValue = currentValue;
          minChunkIndex = i;
        }
      }
    }

    if (minChunkIndex !== -1 && minValue !== null) {
      result.push(minValue);
      indices[minChunkIndex]++;
    }
  }

  return result;
};

/**
 * Calculates pagination state based on total rows, current page, and page size.
 * Ensures the current page is within valid bounds.
 *
 * @param {number} totalRows - Total number of rows in the dataset
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} pageSize - Number of rows per page
 * @returns {PaginationState} The calculated pagination state
 *
 * @example
 * ```typescript
 * const pagination = calculatePagination(500, 3, 50);
 * // Result: { currentPage: 3, pageSize: 50, totalPages: 10, totalRows: 500 }
 * ```
 */
export const calculatePagination = (
  totalRows: number,
  currentPage: number,
  pageSize: number
): PaginationState => {
  const totalPages = Math.ceil(totalRows / pageSize);
  return {
    currentPage:
      totalPages === 0 ? 1 : Math.min(Math.max(1, currentPage), totalPages),
    pageSize,
    totalPages,
    totalRows,
  };
};

/**
 * Extracts a specific page of data from the full dataset.
 *
 * @param {any[][]} data - The full dataset
 * @param {number} currentPage - The page to extract (1-based)
 * @param {number} pageSize - Number of rows per page
 * @returns {any[][]} The data for the specified page
 *
 * @example
 * ```typescript
 * const allData = generateDataset(1000);
 * const pageData = getPageData(allData, 2, 50); // Get page 2 with 50 items per page
 * ```
 */
export const getPageData = (
  data: any[][],
  currentPage: number,
  pageSize: number
): any[][] => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

/**
 * Calculates the range of visible items for virtual scrolling.
 * Only renders items that are currently visible in the viewport plus an overscan area.
 *
 * @param {number} scrollTop - Current scroll position from the top
 * @param {number} containerHeight - Height of the scrollable container
 * @param {number} itemHeight - Height of each item in pixels
 * @param {number} totalItems - Total number of items in the dataset
 * @param {number} [overscan=5] - Number of items to render outside the visible area
 * @returns {{ startIndex: number; endIndex: number }} The range of items to render
 *
 * @example
 * ```typescript
 * const range = calculateVisibleRange(100, 400, 48, 1000, 5);
 * // Result: { startIndex: 0, endIndex: 13 } (renders items 0-13)
 * ```
 */
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 5
): { startIndex: number; endIndex: number } => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
};

/**
 * Creates a debounced version of a function.
 * The debounced function will only execute after the specified delay has passed
 * since the last time it was called. This is useful for performance optimization
 * when dealing with frequent events like sorting or filtering.
 *
 * @template T - The type of the function to debounce
 * @param {T} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {(...args: Parameters<T>) => void} The debounced function
 *
 * @example
 * ```typescript
 * const debouncedSort = debounce((column, direction) => {
 *   performExpensiveSort(column, direction);
 * }, 300);
 *
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSort("name", "asc");
 * debouncedSort("name", "desc");
 * debouncedSort("age", "asc");
 * ```
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
