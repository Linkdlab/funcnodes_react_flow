import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CustomColorPicker, HSLColorPicker } from "./index";

describe("HSLColorPicker", () => {
  const mockOnChange = vi.fn();
  const mockColorConverter = {
    hsl: () => [180, 50, 50],
    rgb: () => [64, 191, 191],
    hsv: () => [180, 67, 75],
    hex: () => "40bfbf",
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders color preview and sliders", () => {
    render(
      <HSLColorPicker
        onChange={mockOnChange}
        colorconverter={mockColorConverter}
      />
    );

    expect(screen.getByText("Color Preview")).toBeInTheDocument();
    expect(screen.getByText("RGB")).toBeInTheDocument();
    expect(screen.getByText("HSL")).toBeInTheDocument();
    expect(screen.getByText("HSV")).toBeInTheDocument();
    expect(screen.getByText("HEX")).toBeInTheDocument();
  });

  it("calls onChange when RGB sliders are moved", () => {
    render(
      <HSLColorPicker
        onChange={mockOnChange}
        colorconverter={mockColorConverter}
      />
    );

    const redSlider = screen.getByDisplayValue("64");
    fireEvent.change(redSlider, { target: { value: "128" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("calls onChange when HSL sliders are moved", () => {
    render(
      <HSLColorPicker
        onChange={mockOnChange}
        colorconverter={mockColorConverter}
      />
    );

    // Get all sliders with value "180" and select the first one (HSL Hue)
    const hueSliders = screen.getAllByDisplayValue("180");
    fireEvent.change(hueSliders[0], { target: { value: "90" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("calls onChange when hex input is changed", () => {
    render(
      <HSLColorPicker
        onChange={mockOnChange}
        colorconverter={mockColorConverter}
      />
    );

    const hexInput = screen.getByDisplayValue("40bfbf");
    fireEvent.change(hexInput, { target: { value: "ff0000" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("handles null color converter when allow_null is true", () => {
    render(
      <HSLColorPicker
        onChange={mockOnChange}
        colorconverter={null}
        allow_null={true}
      />
    );

    expect(screen.getByText("Color Preview")).toBeInTheDocument();
  });

  it("throws error when color converter is null and allow_null is false", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<HSLColorPicker onChange={mockOnChange} colorconverter={null} />);
    }).toThrow("Color converter is null");

    consoleSpy.mockRestore();
  });
});

describe("CustomColorPicker", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders color picker button", () => {
    render(<CustomColorPicker onChange={mockOnChange} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle("background: #000000");
  });

  it("renders with initial color data", async () => {
    render(
      <CustomColorPicker
        onChange={mockOnChange}
        inicolordata={[255, 0, 0]}
        inicolorspace="rgb"
      />
    );

    const button = screen.getByRole("button");
    // Wait for the button to be updated with the color style
    await waitFor(() => {
      expect(button).toHaveStyle({ background: "#FF0000" });
    });
  });

  it("renders with hex color data", () => {
    render(
      <CustomColorPicker
        onChange={mockOnChange}
        inicolordata="00ff00"
        inicolorspace="hex"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveStyle("background: #00ff00");
  });

  it("opens color picker when button is clicked", async () => {
    render(<CustomColorPicker onChange={mockOnChange} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Color Preview")).toBeInTheDocument();
    });
  });

  it("calls onChange after delay when color is changed", async () => {
    render(<CustomColorPicker onChange={mockOnChange} delay={500} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Color Preview")).toBeInTheDocument();
    });

    // Get all sliders - there will be many with value "0", get the RGB Red slider (first one)
    const allSliders = screen.getAllByDisplayValue("0");
    const redSlider = allSliders[0]; // First slider is RGB Red
    fireEvent.change(redSlider, { target: { value: "255" } });

    // Should not be called immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Wait for the delay to pass
    await waitFor(
      () => {
        expect(mockOnChange).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it("uses custom portal container when provided", () => {
    const customContainer = document.createElement("div");
    document.body.appendChild(customContainer);

    render(
      <CustomColorPicker
        onChange={mockOnChange}
        portalContainer={customContainer}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // The popover content should be rendered in the custom container
    expect(customContainer.querySelector(".iotooltipcontent")).toBeTruthy();

    document.body.removeChild(customContainer);
  });

  it("handles allow_null prop correctly", async () => {
    render(
      <CustomColorPicker
        onChange={mockOnChange}
        allow_null={true}
        delay={100}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Color Preview")).toBeInTheDocument();
    });

    // Clear hex input to set null - hex value is "000000" for black [0,0,0]
    const hexInput = screen.getByDisplayValue("000000");
    fireEvent.change(hexInput, { target: { value: "" } });

    // Should not throw error
    expect(screen.getByText("Color Preview")).toBeInTheDocument();

    // Wait for onChange to be called with null
    await waitFor(
      () => {
        expect(mockOnChange).toHaveBeenCalledWith(null);
      },
      { timeout: 500 }
    );
  });

  it("updates color when props change", async () => {
    const { rerender } = render(
      <CustomColorPicker
        onChange={mockOnChange}
        inicolordata={[255, 0, 0]}
        inicolorspace="rgb"
        delay={100}
      />
    );

    const button = screen.getByRole("button");
    await waitFor(() => {
      expect(button).toHaveStyle({ background: "#FF0000" });
    });

    rerender(
      <CustomColorPicker
        onChange={mockOnChange}
        inicolordata={[0, 255, 0]}
        inicolorspace="rgb"
        delay={100}
      />
    );

    await waitFor(
      () => {
        expect(button).toHaveStyle({ background: "#00FF00" });
      },
      { timeout: 500 }
    );
  });
});
