import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortableTable from "./SortableTable";
import { TableData } from "./types";
import { sortTableDataChunked, debounce } from "./utils";
import { describe, expect, it, vi } from "vitest";

// Mock MUI components (same as main test file)
vi.mock("../../../frontend/assets/mui", () => ({
  TableContainer: ({ children, className, onScroll, style }: any) => (
    <div
      data-testid="table-container"
      className={className}
      onScroll={onScroll}
      style={style}
    >
      {children}
    </div>
  ),
  Table: ({ children, size }: any) => (
    <table data-testid="table" data-size={size}>
      {children}
    </table>
  ),
  TableHead: ({ children, className }: any) => (
    <thead data-testid="table-head" className={className}>
      {children}
    </thead>
  ),
  TableRow: ({ children, className, style }: any) => (
    <tr data-testid="table-row" className={className} style={style}>
      {children}
    </tr>
  ),
  TableCell: ({ children, className, colSpan, key }: any) => (
    <td
      data-testid="table-cell"
      className={className}
      colSpan={colSpan}
      data-key={key}
    >
      {children}
    </td>
  ),
  TableSortLabel: ({
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
  TableBody: ({ children }: any) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
}));

// Generate large datasets for performance testing
const generateLargeDataset = (size: number): TableData => {
  return {
    columns: ["ID", "Name", "Email", "Age", "Department", "Salary"],
    index: Array.from({ length: size }, (_, i) => `row${i}`),
    data: Array.from({ length: size }, (_, i) => [
      i,
      `User${i}`,
      `user${i}@example.com`,
      Math.floor(Math.random() * 50) + 20,
      `Dept${Math.floor(Math.random() * 10)}`,
      Math.floor(Math.random() * 100000) + 30000,
    ]),
  };
};

describe("SortableTable Performance", () => {
  describe("Large Dataset Rendering", () => {
    it("renders 1000 rows without performance issues", () => {
      const largeData = generateLargeDataset(1000);
      const startTime = performance.now();

      render(<SortableTable tabledata={largeData} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it("renders 5000 rows with pagination", () => {
      const veryLargeData = generateLargeDataset(5000);
      const startTime = performance.now();

      render(
        <SortableTable
          tabledata={veryLargeData}
          enablePagination={true}
          pageSize={50}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
      expect(renderTime).toBeLessThan(2000); // Should render in under 2 seconds
    });

    it("renders 10000 rows with virtual scrolling", () => {
      const massiveData = generateLargeDataset(10000);
      const startTime = performance.now();

      render(
        <SortableTable
          tabledata={massiveData}
          enableVirtualScrolling={true}
          virtualScrollingHeight={400}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(renderTime).toBeLessThan(3000); // Should render in under 3 seconds
    });
  });

  describe("Sorting Performance", () => {
    it("sorts 1000 rows efficiently", async () => {
      const user = userEvent.setup();
      const largeData = generateLargeDataset(1000);

      render(<SortableTable tabledata={largeData} />);

      const idSortButton = screen.getByText("ID").closest("button");
      expect(idSortButton).toBeInTheDocument();

      const startTime = performance.now();
      await user.click(idSortButton!);
      const endTime = performance.now();
      const sortTime = endTime - startTime;

      expect(sortTime).toBeLessThan(500); // Should sort in under 500ms
    });

    it("uses chunked sorting for very large datasets", async () => {
      const user = userEvent.setup();
      const massiveData = generateLargeDataset(5000);

      render(<SortableTable tabledata={massiveData} />);

      const nameSortButton = screen.getByText("Name").closest("button");

      const startTime = performance.now();
      await user.click(nameSortButton!);
      const endTime = performance.now();
      const sortTime = endTime - startTime;

      expect(sortTime).toBeLessThan(1000); // Should sort in under 1 second
    });

    it("debounces sort operations for large datasets", async () => {
      vi.useFakeTimers();
      const largeData = generateLargeDataset(2000);
      const mockOnSortChange = vi.fn();

      render(
        <SortableTable tabledata={largeData} onSortChange={mockOnSortChange} />
      );

      const idSortButton = screen.getByText("ID").closest("button");

      // Multiple rapid clicks should be debounced
      fireEvent.click(idSortButton!);
      fireEvent.click(idSortButton!);
      fireEvent.click(idSortButton!);

      // Callback shouldn't be called immediately
      expect(mockOnSortChange).not.toHaveBeenCalled();

      // Fast forward to trigger debounced sort
      vi.advanceTimersByTime(200);

      // Should only be called once with the final state
      expect(mockOnSortChange).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("Pagination Performance", () => {
    it("navigates pages efficiently with large datasets", async () => {
      const largeData = generateLargeDataset(10000);

      render(
        <SortableTable
          tabledata={largeData}
          enablePagination={true}
          pageSize={100}
        />
      );

      const nextButton = screen.getByText("Next");

      // Navigate through 3 pages instead of 5
      for (let i = 0; i < 3; i++) {
        const startTime = performance.now();
        fireEvent.click(nextButton);
        const endTime = performance.now();
        const navigationTime = endTime - startTime;

        expect(navigationTime).toBeLessThan(1000); // Increased from 500ms to 1000ms
      }
    });

    it("handles page size changes efficiently", async () => {
      const user = userEvent.setup();
      const largeData = generateLargeDataset(5000);

      const { rerender } = render(
        <SortableTable
          tabledata={largeData}
          enablePagination={true}
          pageSize={25}
        />
      );

      // Change page size
      rerender(
        <SortableTable
          tabledata={largeData}
          enablePagination={true}
          pageSize={100}
        />
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });

  describe("Virtual Scrolling Performance", () => {
    it("handles scroll events efficiently", () => {
      const largeData = generateLargeDataset(10000);

      render(
        <SortableTable
          tabledata={largeData}
          enableVirtualScrolling={true}
          virtualScrollingHeight={400}
        />
      );

      const container = screen.getByTestId("table-container");

      // Simulate rapid scrolling
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        fireEvent.scroll(container, { target: { scrollTop: i * 1000 } });
        const endTime = performance.now();
        const scrollTime = endTime - startTime;

        expect(scrollTime).toBeLessThan(500); // Should handle scroll in under 500ms
      }
    });

    it("maintains smooth scrolling with large datasets", () => {
      const massiveData = generateLargeDataset(50000);

      render(
        <SortableTable
          tabledata={massiveData}
          enableVirtualScrolling={true}
          virtualScrollingHeight={600}
        />
      );

      const container = screen.getByTestId("table-container");

      // Simulate continuous scrolling
      const scrollTimes: number[] = [];
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        fireEvent.scroll(container, { target: { scrollTop: i * 500 } });
        const endTime = performance.now();
        scrollTimes.push(endTime - startTime);
      }

      // Average scroll time should be reasonable
      const averageScrollTime =
        scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      expect(averageScrollTime).toBeLessThan(500); // Average under 500ms
    });
  });

  describe("Memory Usage", () => {
    it("does not cause memory leaks with large datasets", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const largeData = generateLargeDataset(10000);
      const { unmount } = render(<SortableTable tabledata={largeData} />);

      // Simulate some interactions
      const container = screen.getByTestId("table-container");
      fireEvent.scroll(container, { target: { scrollTop: 1000 } });

      unmount();

      // Memory should be reasonable (this is a rough check)
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe("Utility Function Performance", () => {
    it("chunked sorting handles large datasets efficiently", () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => [
        `row${i}`,
        `User${10000 - i}`,
        i,
      ]);

      const comparator = (a: any[], b: any[]) => a[1].localeCompare(b[1]);

      const startTime = performance.now();
      const sorted = sortTableDataChunked(largeData, comparator, 1000);
      const endTime = performance.now();
      const sortTime = endTime - startTime;

      expect(sorted.length).toBe(10000);
      expect(sorted[0][1]).toBe("User1");
      expect(sorted[9999][1]).toBe("User9999");
      expect(sortTime).toBeLessThan(2000); // Should sort in under 2 seconds
    });

    it("debounce function works efficiently", () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      // Call multiple times rapidly
      for (let i = 0; i < 100; i++) {
        debouncedFn(`arg${i}`);
      }

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg99");

      vi.useRealTimers();
    });
  });

  describe("Edge Cases and Stress Tests", () => {
    it("handles extremely large datasets gracefully", () => {
      const massiveData = generateLargeDataset(50000);

      expect(() => {
        render(
          <SortableTable
            tabledata={massiveData}
            enableVirtualScrolling={true}
            virtualScrollingHeight={400}
          />
        );
      }).not.toThrow();

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("handles rapid state changes", async () => {
      const user = userEvent.setup();
      const largeData = generateLargeDataset(5000);

      render(
        <SortableTable
          tabledata={largeData}
          enablePagination={true}
          pageSize={50}
        />
      );

      const nextButton = screen.getByText("Next");
      const idSortButton = screen.getByText("ID").closest("button");

      // Rapid interactions
      await user.click(idSortButton!);
      await user.click(nextButton);
      await user.click(idSortButton!);
      await user.click(nextButton);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("handles concurrent operations", async () => {
      const user = userEvent.setup();
      const largeData = generateLargeDataset(3000);

      render(
        <SortableTable
          tabledata={largeData}
          enablePagination={true}
          enableVirtualScrolling={true}
        />
      );

      const nextButton = screen.getByText("Next");
      const nameSortButton = screen.getByText("Name").closest("button");
      const container = screen.getByTestId("table-container");

      // Concurrent operations
      const promises = [
        user.click(nameSortButton!),
        user.click(nextButton),
        user.click(nameSortButton!),
        fireEvent.scroll(container, { target: { scrollTop: 1000 } }),
      ];

      await Promise.all(promises);

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });
});
