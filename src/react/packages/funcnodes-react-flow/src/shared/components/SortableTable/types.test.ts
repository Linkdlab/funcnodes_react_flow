import { describe, expect, it, vi } from "vitest";
import {
  TableData,
  TransformedTableData,
  SortDirection,
  ComparerFunction,
  SortableTableProps,
  PaginationState,
  VirtualScrollingConfig,
} from "./types";

// Type validation tests
describe("SortableTable Types", () => {
  describe("TableData", () => {
    it("accepts valid TableData structure", () => {
      const validData: TableData = {
        columns: ["Name", "Age", "City"],
        index: ["row1", "row2", "row3"],
        data: [
          ["Alice", 25, "New York"],
          ["Bob", 30, "Los Angeles"],
          ["Charlie", 35, "Chicago"],
        ],
      };

      expect(validData.columns).toEqual(["Name", "Age", "City"]);
      expect(validData.index).toEqual(["row1", "row2", "row3"]);
      expect(validData.data).toHaveLength(3);
    });

    it("allows empty arrays", () => {
      const emptyData: TableData = {
        columns: [],
        index: [],
        data: [],
      };

      expect(emptyData.columns).toEqual([]);
      expect(emptyData.index).toEqual([]);
      expect(emptyData.data).toEqual([]);
    });

    it("allows mixed data types in data array", () => {
      const mixedData: TableData = {
        columns: ["ID", "Name", "Active", "Score"],
        index: ["row1", "row2"],
        data: [
          [1, "Alice", true, 95.5],
          [2, "Bob", false, 87.2],
        ],
      };

      expect(mixedData.data[0]).toEqual([1, "Alice", true, 95.5]);
      expect(mixedData.data[1]).toEqual([2, "Bob", false, 87.2]);
    });
  });

  describe("TransformedTableData", () => {
    it("accepts valid TransformedTableData structure", () => {
      const validTransformed: TransformedTableData = {
        header: ["index", "Name", "Age", "City"],
        rows: [
          ["row1", "Alice", 25, "New York"],
          ["row2", "Bob", 30, "Los Angeles"],
          ["row3", "Charlie", 35, "Chicago"],
        ],
      };

      expect(validTransformed.header).toEqual(["index", "Name", "Age", "City"]);
      expect(validTransformed.rows).toHaveLength(3);
    });

    it("allows empty transformed data", () => {
      const emptyTransformed: TransformedTableData = {
        header: [],
        rows: [],
      };

      expect(emptyTransformed.header).toEqual([]);
      expect(emptyTransformed.rows).toEqual([]);
    });
  });

  describe("SortDirection", () => {
    it("accepts 'asc' value", () => {
      const ascending: SortDirection = "asc";
      expect(ascending).toBe("asc");
    });

    it("accepts 'desc' value", () => {
      const descending: SortDirection = "desc";
      expect(descending).toBe("desc");
    });

    it("can be used in function parameters", () => {
      const testFunction = (direction: SortDirection) => direction;

      expect(testFunction("asc")).toBe("asc");
      expect(testFunction("desc")).toBe("desc");
    });
  });

  describe("ComparerFunction", () => {
    it("accepts valid comparator function", () => {
      const numericComparator: ComparerFunction = (a, b) => {
        if (a[0]! < b[0]!) return -1;
        if (a[0]! > b[0]!) return 1;
        return 0;
      };

      expect(numericComparator([1], [2])).toBe(-1);
      expect(numericComparator([2], [1])).toBe(1);
      expect(numericComparator([1], [1])).toBe(0);
    });

    it("accepts string comparator", () => {
      const stringComparator: ComparerFunction = (a, b) => {
        if (a[0]! < b[0]!) return -1;
        if (a[0]! > b[0]!) return 1;
        return 0;
      };

      expect(stringComparator(["Alice"], ["Bob"])).toBe(-1);
      expect(stringComparator(["Bob"], ["Alice"])).toBe(1);
      expect(stringComparator(["Alice"], ["Alice"])).toBe(0);
    });

    it("can be used with any data types", () => {
      const mixedComparator: ComparerFunction = (a, b) => {
        const aStr = String(a[0]);
        const bStr = String(b[0]);
        const result = aStr.localeCompare(bStr);
        return result < 0 ? -1 : result > 0 ? 1 : 0;
      };

      expect(mixedComparator(["Alice"], [25])).toBe(1);
      expect(mixedComparator([25], ["Alice"])).toBe(-1);
    });
  });

  describe("SortableTableProps", () => {
    it("accepts minimal props", () => {
      const minimalProps: SortableTableProps = {
        tabledata: {
          columns: ["Name"],
          index: ["row1"],
          data: [["Alice"]],
        },
      };

      expect(minimalProps.tabledata).toBeDefined();
      expect(minimalProps.className).toBeUndefined();
      expect(minimalProps.size).toBeUndefined();
    });

    it("accepts all optional props", () => {
      const fullProps: SortableTableProps = {
        tabledata: {
          columns: ["Name", "Age"],
          index: ["row1", "row2"],
          data: [
            ["Alice", 25],
            ["Bob", 30],
          ],
        },
        className: "custom-table",
        size: "medium",
        onSortChange: vi.fn(),
        enablePagination: true,
        pageSize: 25,
        enableVirtualScrolling: true,
        virtualScrollingHeight: 500,
        enableLazyLoading: true,
        onLoadMore: vi.fn(),
      };

      expect(fullProps.className).toBe("custom-table");
      expect(fullProps.size).toBe("medium");
      expect(fullProps.enablePagination).toBe(true);
      expect(fullProps.pageSize).toBe(25);
      expect(fullProps.enableVirtualScrolling).toBe(true);
      expect(fullProps.virtualScrollingHeight).toBe(500);
      expect(fullProps.enableLazyLoading).toBe(true);
    });

    it("allows function callbacks", () => {
      const mockOnSortChange = vi.fn();
      const mockOnLoadMore = vi.fn();

      const propsWithCallbacks: SortableTableProps = {
        tabledata: {
          columns: ["Name"],
          index: ["row1"],
          data: [["Alice"]],
        },
        onSortChange: mockOnSortChange,
        onLoadMore: mockOnLoadMore,
      };

      expect(typeof propsWithCallbacks.onSortChange).toBe("function");
      expect(typeof propsWithCallbacks.onLoadMore).toBe("function");
    });
  });

  describe("PaginationState", () => {
    it("accepts valid pagination state", () => {
      const validPagination: PaginationState = {
        currentPage: 2,
        pageSize: 25,
        totalPages: 10,
        totalRows: 250,
      };

      expect(validPagination.currentPage).toBe(2);
      expect(validPagination.pageSize).toBe(25);
      expect(validPagination.totalPages).toBe(10);
      expect(validPagination.totalRows).toBe(250);
    });

    it("allows edge cases", () => {
      const edgeCasePagination: PaginationState = {
        currentPage: 1,
        pageSize: 1,
        totalPages: 1,
        totalRows: 1,
      };

      expect(edgeCasePagination.currentPage).toBe(1);
      expect(edgeCasePagination.pageSize).toBe(1);
      expect(edgeCasePagination.totalPages).toBe(1);
      expect(edgeCasePagination.totalRows).toBe(1);
    });

    it("allows empty dataset", () => {
      const emptyPagination: PaginationState = {
        currentPage: 1,
        pageSize: 25,
        totalPages: 0,
        totalRows: 0,
      };

      expect(emptyPagination.totalPages).toBe(0);
      expect(emptyPagination.totalRows).toBe(0);
    });
  });

  describe("VirtualScrollingConfig", () => {
    it("accepts valid virtual scrolling config", () => {
      const validConfig: VirtualScrollingConfig = {
        itemHeight: 48,
        overscan: 5,
        containerHeight: 400,
      };

      expect(validConfig.itemHeight).toBe(48);
      expect(validConfig.overscan).toBe(5);
      expect(validConfig.containerHeight).toBe(400);
    });

    it("allows different item heights", () => {
      const tallItemsConfig: VirtualScrollingConfig = {
        itemHeight: 80,
        overscan: 3,
        containerHeight: 600,
      };

      expect(tallItemsConfig.itemHeight).toBe(80);
      expect(tallItemsConfig.overscan).toBe(3);
      expect(tallItemsConfig.containerHeight).toBe(600);
    });

    it("allows zero overscan", () => {
      const zeroOverscanConfig: VirtualScrollingConfig = {
        itemHeight: 48,
        overscan: 0,
        containerHeight: 400,
      };

      expect(zeroOverscanConfig.overscan).toBe(0);
    });
  });

  describe("Type Compatibility", () => {
    it("allows SortDirection in function parameters", () => {
      const testFunction = (direction: SortDirection) => direction;

      expect(testFunction("asc")).toBe("asc");
      expect(testFunction("desc")).toBe("desc");
    });

    it("allows ComparerFunction in array methods", () => {
      const data = [
        ["row1", "Alice", 25],
        ["row2", "Bob", 30],
      ];
      const comparator: ComparerFunction = (a, b) =>
        a[1]! < b[1]! ? -1 : a[1]! > b[1]! ? 1 : 0;

      const sorted = [...data].sort(comparator);

      expect(sorted[0][1]).toBe("Alice");
      expect(sorted[1][1]).toBe("Bob");
    });

    it("allows PaginationState in state management", () => {
      const initialState: PaginationState = {
        currentPage: 1,
        pageSize: 25,
        totalPages: 1,
        totalRows: 25,
      };

      const updatedState: PaginationState = {
        ...initialState,
        currentPage: 2,
      };

      expect(updatedState.currentPage).toBe(2);
      expect(updatedState.pageSize).toBe(25);
    });

    it("allows VirtualScrollingConfig in calculations", () => {
      const config: VirtualScrollingConfig = {
        itemHeight: 48,
        overscan: 5,
        containerHeight: 400,
      };

      const visibleItems = Math.floor(
        config.containerHeight / config.itemHeight
      );
      const totalItems = visibleItems + config.overscan * 2;

      expect(visibleItems).toBe(8);
      expect(totalItems).toBe(18);
    });
  });
});
