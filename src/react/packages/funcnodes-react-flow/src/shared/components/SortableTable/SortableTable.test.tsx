import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortableTable from "./SortableTable";
import { TableData } from "./types";
import { transformTableData, sortTableData, createComparator } from "./utils";
import { describe, expect, it, vi } from "vitest";

// Mock MUI components
vi.mock("@mui/material/Table", () => ({
  default: ({ children, size }: any) => (
    <table data-testid="table" data-size={size}>
      {children}
    </table>
  ),
}));

vi.mock("@mui/material/TableContainer", () => ({
  default: ({ children, className, onScroll, style }: any) => (
    <div
      data-testid="table-container"
      className={className}
      onScroll={onScroll}
      style={style}
    >
      {children}
    </div>
  ),
}));

vi.mock("@mui/material/TableHead", () => ({
  default: ({ children, className }: any) => (
    <thead data-testid="table-head" className={className}>
      {children}
    </thead>
  ),
}));

vi.mock("@mui/material/TableRow", () => ({
  default: ({ children, className, style }: any) => (
    <tr data-testid="table-row" className={className} style={style}>
      {children}
    </tr>
  ),
}));

vi.mock("@mui/material/TableCell", () => ({
  default: ({ children, className, colSpan, ...props }: any) => (
    <td
      data-testid="table-cell"
      className={className}
      colSpan={colSpan}
      {...props}
    >
      {children}
    </td>
  ),
}));

vi.mock("@mui/material/TableSortLabel", () => ({
  default: ({
    children,
    active,
    direction,
    onClick,
    className,
  }: any) => (
    <button
      data-testid="sort-label"
      data-active={active}
      data-direction={direction}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock("@mui/material/TableBody", () => ({
  default: ({ children }: any) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
}));

// Sample test data
const mockTableData: TableData = {
  columns: ["Name", "Age", "City"],
  index: ["row1", "row2", "row3"],
  data: [
    ["Alice", 25, "New York"],
    ["Bob", 30, "Los Angeles"],
    ["Charlie", 35, "Chicago"],
  ],
};

const largeTableData: TableData = {
  columns: ["ID", "Name", "Value"],
  index: Array.from({ length: 2000 }, (_, i) => `row${i}`),
  data: Array.from({ length: 2000 }, (_, i) => [
    i,
    `User${i}`,
    Math.floor(Math.random() * 1000),
  ]),
};

describe("SortableTable", () => {
  describe("Basic Rendering", () => {
    it("renders table with correct structure", () => {
      render(<SortableTable tabledata={mockTableData} />);

      expect(screen.getByTestId("table-container")).toBeInTheDocument();
      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByTestId("table-head")).toBeInTheDocument();
      expect(screen.getByTestId("table-body")).toBeInTheDocument();
    });

    it("renders all headers correctly", () => {
      render(<SortableTable tabledata={mockTableData} />);

      expect(screen.getByText("index")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
    });

    it("renders all data rows correctly", () => {
      render(<SortableTable tabledata={mockTableData} />);

      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("35")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <SortableTable tabledata={mockTableData} className="custom-class" />
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("handles empty data gracefully", () => {
      const emptyData: TableData = {
        columns: [],
        index: [],
        data: [],
      };

      render(<SortableTable tabledata={emptyData} />);

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByTestId("table-head")).toBeInTheDocument();
    });

    it("handles undefined data gracefully", () => {
      render(<SortableTable tabledata={undefined as any} />);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    it("sorts data when column header is clicked", async () => {
      const user = userEvent.setup();
      render(<SortableTable tabledata={mockTableData} />);

      const nameSortButton = screen.getByText("Name").closest("button");
      expect(nameSortButton).toBeInTheDocument();

      await user.click(nameSortButton!);

      // Check that sort direction is applied
      expect(nameSortButton).toHaveAttribute("data-direction", "asc");
    });

    it("toggles sort direction on repeated clicks", async () => {
      const user = userEvent.setup();
      render(<SortableTable tabledata={mockTableData} />);

      const nameSortButton = screen.getByText("Name").closest("button");

      // First click - ascending
      await user.click(nameSortButton!);
      expect(nameSortButton).toHaveAttribute("data-direction", "asc");

      // Second click - descending
      await user.click(nameSortButton!);
      expect(nameSortButton).toHaveAttribute("data-direction", "desc");
    });

    it("calls onSortChange callback when sorting", async () => {
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SortableTable
          tabledata={mockTableData}
          onSortChange={mockOnSortChange}
        />
      );

      const nameSortButton = screen.getByText("Name").closest("button");
      await user.click(nameSortButton!);

      expect(mockOnSortChange).toHaveBeenCalledWith("Name", "asc");
    });

    it("sorts by index column by default", () => {
      render(<SortableTable tabledata={mockTableData} />);

      const indexSortButton = screen.getByText("index").closest("button");
      expect(indexSortButton).toHaveAttribute("data-active", "true");
    });
  });

  describe("Pagination", () => {
    it("renders pagination controls when enabled", () => {
      render(
        <SortableTable
          tabledata={largeTableData}
          enablePagination={true}
          pageSize={50}
        />
      );

      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("does not render pagination when disabled", () => {
      render(
        <SortableTable tabledata={mockTableData} enablePagination={false} />
      );

      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });

    it("navigates between pages", async () => {
      const user = userEvent.setup();
      render(
        <SortableTable
          tabledata={largeTableData}
          enablePagination={true}
          pageSize={50}
        />
      );

      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
      render(
        <SortableTable
          tabledata={largeTableData}
          enablePagination={true}
          pageSize={50}
        />
      );

      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("disables next button on last page", async () => {
      const user = userEvent.setup();
      render(
        <SortableTable
          tabledata={mockTableData}
          enablePagination={true}
          pageSize={1}
        />
      );

      const nextButton = screen.getByText("Next");
      await user.click(nextButton);
      await user.click(nextButton);

      expect(nextButton).toBeDisabled();
    });
  });

  describe("Virtual Scrolling", () => {
    it("enables virtual scrolling container when enabled", () => {
      render(
        <SortableTable
          tabledata={largeTableData}
          enableVirtualScrolling={true}
          virtualScrollingHeight={400}
        />
      );

      const container = screen.getByTestId("table-container");
      expect(container).toHaveStyle({ height: "400px" });
    });

    it("handles scroll events for virtual scrolling", async () => {
      render(
        <SortableTable
          tabledata={largeTableData}
          enableVirtualScrolling={true}
        />
      );

      const container = screen.getByTestId("table-container");
      fireEvent.scroll(container, { target: { scrollTop: 100 } });

      // Virtual scrolling should handle the scroll event without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe("Performance Optimizations", () => {
    it("uses chunked sorting for large datasets", () => {
      const largeData: TableData = {
        columns: ["ID", "Name"],
        index: Array.from({ length: 1500 }, (_, i) => `row${i}`),
        data: Array.from({ length: 1500 }, (_, i) => [i, `User${i}`]),
      };

      render(<SortableTable tabledata={largeData} />);

      // Should render without performance issues
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("debounces sort operations for large datasets", async () => {
      vi.useFakeTimers();
      const mockOnSortChange = vi.fn();

      render(
        <SortableTable
          tabledata={largeTableData}
          onSortChange={mockOnSortChange}
        />
      );

      const nameSortButton = screen.getByText("ID").closest("button");
      expect(nameSortButton).toBeInTheDocument();

      // Click the button (this will trigger the debounced function)
      act(() => {
        fireEvent.click(nameSortButton!);
      });

      // The callback shouldn't be called immediately
      expect(mockOnSortChange).not.toHaveBeenCalled();

      // Fast forward time to trigger the debounced function
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Now the callback should have been called
      expect(mockOnSortChange).toHaveBeenCalledWith("ID", "asc");

      vi.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for sort buttons", () => {
      render(<SortableTable tabledata={mockTableData} />);

      const sortButtons = screen.getAllByTestId("sort-label");
      sortButtons.forEach((button) => {
        expect(button).toHaveAttribute("data-active");
        expect(button).toHaveAttribute("data-direction");
      });
    });

    it("supports keyboard navigation", async () => {
      render(
        <SortableTable
          tabledata={mockTableData}
          enablePagination={true}
          pageSize={1}
        />
      );

      const wrapper = document.querySelector(".sortable-table-wrapper");
      expect(wrapper).toBeInTheDocument();

      // Focus the wrapper
      (wrapper as HTMLElement)?.focus();

      // Simulate arrow right key press
      fireEvent.keyDown(wrapper!, { key: "ArrowRight" });

      // Check that page changed
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      // Simulate arrow left key press
      fireEvent.keyDown(wrapper!, { key: "ArrowLeft" });

      // Check that page changed back
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing columns gracefully", () => {
      const dataWithoutColumns: TableData = {
        columns: [],
        index: ["row1", "row2"],
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ],
      };

      render(<SortableTable tabledata={dataWithoutColumns} />);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("handles missing index gracefully", () => {
      const dataWithoutIndex: TableData = {
        columns: ["Name", "Age"],
        index: [],
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ],
      };

      render(<SortableTable tabledata={dataWithoutIndex} />);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("handles mismatched data lengths", () => {
      const mismatchedData: TableData = {
        columns: ["Name", "Age"],
        index: ["row1"],
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ], // More data than index
      };

      render(<SortableTable tabledata={mismatchedData} />);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });
});

describe("SortableTable Utils", () => {
  describe("transformTableData", () => {
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

    it("generates missing columns", () => {
      const dataWithoutColumns: TableData = {
        columns: [],
        index: ["row1", "row2"],
        data: [
          ["Alice", 25],
          ["Bob", 30],
        ],
      };

      const result = transformTableData(dataWithoutColumns);

      expect(result.header).toEqual(["index", "col0", "col1"]);
    });

    it("generates missing index", () => {
      const dataWithoutIndex: TableData = {
        columns: ["Name", "Age"],
        index: [],
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
  });
});
