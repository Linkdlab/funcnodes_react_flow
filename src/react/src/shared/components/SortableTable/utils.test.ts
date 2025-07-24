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
import { TableData } from "./types";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("SortableTable Utils", () => {
  describe("transformTableData", () => {
    const mockTableData: TableData = {
      columns: ["Name", "Age", "City"],
      index: ["row1", "row2", "row3"],
      data: [
        ["Alice", 25, "New York"],
        ["Bob", 30, "Los Angeles"],
        ["Charlie", 35, "Chicago"],
      ],
    };

    it("transforms data correctly", () => {
      const result = transformTableData(mockTableData);

      expect(result.header).toEqual(["index", "Name", "Age", "City"]);
      expect(result.rows).toEqual([
        ["row1", "Alice", 25, "New York"],
        ["row2", "Bob", 30, "Los Angeles"],
        ["row3", "Charlie", 35, "Chicago"],
      ]);
    });

    it("handles undefined data", () => {
      const result = transformTableData(undefined as any);

      expect(result.header).toEqual([]);
      expect(result.rows).toEqual([]);
    });

    it("handles undefined data.data", () => {
      const dataWithUndefinedData: TableData = {
        columns: ["Name", "Age"],
        index: ["row1", "row2"],
        data: undefined as any,
      };

      const result = transformTableData(dataWithUndefinedData);

      expect(result.header).toEqual(["index", "Name", "Age"]);
      expect(result.rows).toEqual([
        ["row1", undefined, undefined],
        ["row2", undefined, undefined],
      ]);
    });

    it("generates missing columns based on first row", () => {
      const dataWithoutColumns: TableData = {
        columns: undefined as any,
        index: ["row1", "row2"],
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ],
      };

      const result = transformTableData(dataWithoutColumns);

      expect(result.header).toEqual(["index", "col0", "col1"]);
      expect(result.rows).toEqual([
        ["row1", "Alice", 25],
        ["row2", "Bob", 30],
      ]);
    });

    it("generates missing columns for empty data", () => {
      const emptyData: TableData = {
        columns: undefined as any,
        index: [],
        data: [],
      };

      const result = transformTableData(emptyData);

      expect(result.header).toEqual(["index"]);
      expect(result.rows).toEqual([]);
    });

    it("generates missing index", () => {
      const dataWithoutIndex: TableData = {
        columns: ["Name", "Age"],
        index: undefined as any,
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ],
      };

      const result = transformTableData(dataWithoutIndex);

      expect(result.header).toEqual(["index", "Name", "Age"]);
      expect(result.rows[0][0]).toBe("row0");
      expect(result.rows[1][0]).toBe("row1");
    });

    it("handles mismatched data and index lengths", () => {
      const mismatchedData: TableData = {
        columns: ["Name", "Age"],
        index: ["row1"], // Only one index
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ], // Two rows
      };

      const result = transformTableData(mismatchedData);

      expect(result.rows).toEqual([
        ["row1", "Alice", 25],
        ["row1", "Bob", 30], // Uses the same index
      ]);
    });

    it("preserves falsy index values correctly", () => {
      const dataWithFalsyIndexes: TableData = {
        columns: ["Name", "Value"],
        index: ["0", "", "false", "null", "valid"], // All falsy values except last one
        data: [
          ["Zero", 100],
          ["Empty", 200],
          ["False", 300],
          ["Null", 400],
          ["Valid", 500],
        ],
      };

      const result = transformTableData(dataWithFalsyIndexes);

      expect(result.rows).toEqual([
        ["0", "Zero", 100],        // "0" as string
        ["", "Empty", 200],        // Empty string should be preserved
        ["false", "False", 300],   // "false" as string
        ["null", "Null", 400],     // "null" as string
        ["valid", "Valid", 500],   // Normal string should be preserved
      ]);
    });
  });

  describe("createComparator", () => {
    it("creates ascending comparator", () => {
      const comparator = createComparator("asc", 1);
      const result = comparator(["row1", "Alice"], ["row2", "Bob"]);

      expect(result).toBe(-1); // Alice < Bob
    });

    it("creates descending comparator", () => {
      const comparator = createComparator("desc", 1);
      const result = comparator(["row1", "Alice"], ["row2", "Bob"]);

      expect(result).toBe(1); // Bob > Alice in descending order
    });

    it("handles equal values", () => {
      const comparator = createComparator("asc", 1);
      const result = comparator(["row1", "Alice"], ["row2", "Alice"]);

      expect(result).toBe(0); // Equal values
    });

    it("handles numeric values", () => {
      const comparator = createComparator("asc", 2);
      const result = comparator(["row1", "Alice", 25], ["row2", "Bob", 30]);

      expect(result).toBe(-1); // 25 < 30
    });

    it("handles mixed data types", () => {
      const comparator = createComparator("asc", 1);
      const result = comparator(["row1", 25], ["row2", "Alice"]);

      // Should handle mixed types gracefully
      expect(typeof result).toBe("number");
    });
  });

  describe("sortTableData", () => {
    it("sorts data correctly", () => {
      const data = [
        ["row1", "Charlie", 35],
        ["row2", "Alice", 25],
        ["row3", "Bob", 30],
      ];

      const comparator = createComparator("asc", 1); // Sort by name
      const result = sortTableData(data, comparator);

      expect(result[0][1]).toBe("Alice");
      expect(result[1][1]).toBe("Bob");
      expect(result[2][1]).toBe("Charlie");
    });

    it("maintains stable sort", () => {
      const data = [
        ["row1", "Alice", 25],
        ["row2", "Alice", 30],
        ["row3", "Bob", 30],
      ];

      const comparator = createComparator("asc", 1); // Sort by name
      const result = sortTableData(data, comparator);

      // Should maintain original order for equal values
      expect(result[0][0]).toBe("row1");
      expect(result[1][0]).toBe("row2");
    });

    it("handles empty array", () => {
      const data: any[][] = [];
      const comparator = createComparator("asc", 0);

      const result = sortTableData(data, comparator);

      expect(result).toEqual([]);
    });

    it("handles single element array", () => {
      const data = [["row1", "Alice", 25]];
      const comparator = createComparator("asc", 1);

      const result = sortTableData(data, comparator);

      expect(result).toEqual([["row1", "Alice", 25]]);
    });
  });

  describe("sortTableDataChunked", () => {
    it("uses regular sorting for small datasets", () => {
      const data = [
        ["row1", "Charlie", 35],
        ["row2", "Alice", 25],
        ["row3", "Bob", 30],
      ];

      const comparator = createComparator("asc", 1);
      const result = sortTableDataChunked(data, comparator, 1000);

      expect(result[0][1]).toBe("Alice");
      expect(result[1][1]).toBe("Bob");
      expect(result[2][1]).toBe("Charlie");
    });

    it("uses chunked sorting for large datasets", () => {
      const largeData = Array.from({ length: 1500 }, (_, i) => [
        `row${i}`,
        `User${1500 - i}`,
        i,
      ]);

      const comparator = createComparator("asc", 1);
      const result = sortTableDataChunked(largeData, comparator, 500);

      // Should be sorted correctly (lexicographic order)
      expect(result.length).toBe(1500);
      expect(result[0][1]).toBe("User1");
      expect(result[1499][1]).toBe("User999");
    });

    it("handles custom chunk size", () => {
      const data = Array.from({ length: 100 }, (_, i) => [
        `row${i}`,
        `User${100 - i}`,
        i,
      ]);

      const comparator = createComparator("asc", 1);
      const result = sortTableDataChunked(data, comparator, 25);

      expect(result.length).toBe(100);
      expect(result[0][1]).toBe("User1");
      expect(result[99][1]).toBe("User99");
    });
  });

  describe("calculatePagination", () => {
    it("calculates pagination correctly", () => {
      const result = calculatePagination(100, 1, 25);

      expect(result).toEqual({
        currentPage: 1,
        pageSize: 25,
        totalPages: 4,
        totalRows: 100,
      });
    });

    it("handles current page out of bounds", () => {
      const result = calculatePagination(100, 10, 25);

      expect(result.currentPage).toBe(4); // Should be clamped to max page
    });

    it("handles current page below minimum", () => {
      const result = calculatePagination(100, 0, 25);

      expect(result.currentPage).toBe(1); // Should be clamped to min page
    });

    it("handles empty dataset", () => {
      const result = calculatePagination(0, 1, 25);

      expect(result).toEqual({
        currentPage: 1,
        pageSize: 25,
        totalPages: 0,
        totalRows: 0,
      });
    });

    it("handles page size larger than total rows", () => {
      const result = calculatePagination(10, 1, 25);

      expect(result).toEqual({
        currentPage: 1,
        pageSize: 25,
        totalPages: 1,
        totalRows: 10,
      });
    });
  });

  describe("getPageData", () => {
    it("extracts page data correctly", () => {
      const data = Array.from({ length: 100 }, (_, i) => [
        `row${i}`,
        `User${i}`,
      ]);

      const result = getPageData(data, 2, 25);

      expect(result.length).toBe(25);
      expect(result[0][0]).toBe("row25");
      expect(result[24][0]).toBe("row49");
    });

    it("handles last page with fewer items", () => {
      const data = Array.from({ length: 100 }, (_, i) => [
        `row${i}`,
        `User${i}`,
      ]);

      const result = getPageData(data, 4, 25);

      expect(result.length).toBe(25);
      expect(result[0][0]).toBe("row75");
      expect(result[24][0]).toBe("row99");
    });

    it("handles page beyond available data", () => {
      const data = Array.from({ length: 10 }, (_, i) => [
        `row${i}`,
        `User${i}`,
      ]);

      const result = getPageData(data, 5, 25);

      expect(result.length).toBe(0);
    });

    it("handles empty data", () => {
      const data: any[][] = [];

      const result = getPageData(data, 1, 25);

      expect(result.length).toBe(0);
    });
  });

  describe("calculateVisibleRange", () => {
    it("calculates visible range correctly", () => {
      const result = calculateVisibleRange(100, 400, 48, 1000, 5);

      expect(result.startIndex).toBe(0); // Math.max(0, Math.floor(100/48) - 5)
      expect(result.endIndex).toBe(16); // Math.min(999, Math.ceil((100+400)/48) + 5)
    });

    it("handles scroll position at top", () => {
      const result = calculateVisibleRange(0, 400, 48, 1000, 5);

      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(14);
    });

    it("handles scroll position in middle", () => {
      const result = calculateVisibleRange(500, 400, 48, 1000, 5);

      expect(result.startIndex).toBe(5); // Math.max(0, Math.floor(500/48) - 5)
      expect(result.endIndex).toBe(24); // Math.min(999, Math.ceil((500+400)/48) + 5)
    });

    it("handles scroll position near bottom", () => {
      const result = calculateVisibleRange(45000, 400, 48, 1000, 5);

      expect(result.startIndex).toBe(932); // Math.max(0, Math.floor(45000/48) - 5)
      expect(result.endIndex).toBe(951); // Math.min(999, Math.ceil((45000+400)/48) + 5)
    });

    it("handles small dataset", () => {
      const result = calculateVisibleRange(0, 400, 48, 10, 5);

      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(9); // Math.min(9, Math.ceil((0+400)/48) + 5)
    });

    it("handles custom overscan", () => {
      const result = calculateVisibleRange(100, 400, 48, 1000, 10);

      expect(result.startIndex).toBe(0); // Math.max(0, Math.floor(100/48) - 10)
      expect(result.endIndex).toBe(21); // Math.min(999, Math.ceil((100+400)/48) + 10)
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("debounces function calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      // Call multiple times rapidly
      debouncedFn("arg1");
      debouncedFn("arg2");
      debouncedFn("arg3");

      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time
      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg3");
    });

    it("resets timer on new calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("arg1");

      // Fast forward but not enough to trigger
      vi.advanceTimersByTime(200);

      debouncedFn("arg2");

      // Fast forward again
      vi.advanceTimersByTime(200);

      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward to trigger
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg2");
    });

    it("handles multiple arguments", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn("arg1", "arg2");
      debouncedFn("arg3", "arg4");

      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledWith("arg3", "arg4");
    });

    it("handles zero delay", () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn("arg1");
      vi.runAllTimers();

      expect(mockFn).toHaveBeenCalledWith("arg1");
      vi.useRealTimers();
    });
  });
});
