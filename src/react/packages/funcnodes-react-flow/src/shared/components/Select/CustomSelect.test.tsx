import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CustomSelect } from "./index";

describe("CustomSelect", () => {
  const mockOnChange = vi.fn();
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Select an option...")).toBeInTheDocument();
  });

  it("renders with default value", () => {
    const defaultValue = mockOptions[0];
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
        defaultValue={defaultValue}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("filters options based on search input", async () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "app" } });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    });
  });

  it("filters options by both label and value", async () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "option1" } });

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
    });
  });

  it("calls onChange when an option is selected", async () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const option = screen.getByText("Option 1");
      fireEvent.click(option);
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      mockOptions[0],
      expect.any(Object)
    );
  });

  it("applies custom className", () => {
    const customClass = "custom-select-class";
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
        className={customClass}
      />
    );

    const selectContainer = document.querySelector(`.${customClass}`);
    expect(selectContainer).toBeInTheDocument();
  });

  it("resets to first page when search input changes", async () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`,
    }));

    render(
      <CustomSelect
        options={manyOptions}
        onChange={mockOnChange}
        items_per_page={5}
      />
    );

    const input = screen.getByRole("combobox");

    // First search
    fireEvent.change(input, { target: { value: "option1" } });

    // Change search - should reset to page 0
    fireEvent.change(input, { target: { value: "option2" } });

    await waitFor(() => {
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });
  });

  it("handles empty options array", () => {
    render(
      <CustomSelect
        options={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Select an option...")).toBeInTheDocument();
  });

  it("shows all options when items_per_page is undefined", async () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown", code: "ArrowDown" });

    await waitFor(() => {
      mockOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  it("paginates options when items_per_page is set", async () => {
    const manyOptions = Array.from({ length: 10 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`,
    }));

    render(
      <CustomSelect
        options={manyOptions}
        onChange={mockOnChange}
        items_per_page={3}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown", code: "ArrowDown" });

    await waitFor(() => {
      // Should only show first 3 options
      expect(screen.getByText("Option 0")).toBeInTheDocument();
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.queryByText("Option 3")).not.toBeInTheDocument();
    });
  });

  it("is searchable by default", () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });

  it("filters options case-insensitively", async () => {
    render(
      <CustomSelect
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "APPLE" } });

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
  });
});
