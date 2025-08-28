import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ProgressBar, TqdmState } from "./index";

// Mock the fitTextToContainer utility
vi.mock("@/utils/autolayout/txt", () => ({
  fitTextToContainer: vi.fn(),
}));

describe("ProgressBar", () => {
  const mockFitTextToContainer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockFitTextToContainer).mockImplementation(() => {});
    // Mock window.addEventListener and removeEventListener
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultState: TqdmState = {
    n: 50,
    total: 100,
    elapsed: 10,
    ascii: false,
    unit: "it",
    unit_scale: false,
    unit_divisor: 1000,
  };

  it("renders with default state", () => {
    render(<ProgressBar state={defaultState} />);

    const container = document.querySelector(".reacttqdm");
    expect(container).toBeInTheDocument();

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("renders with custom className", () => {
    const customClass = "custom-progress";
    render(<ProgressBar state={defaultState} className={customClass} />);

    const container = document.querySelector(`.${customClass}`);
    expect(container).toBeInTheDocument();
  });

  it("calculates correct progress percentage", () => {
    const state: TqdmState = {
      ...defaultState,
      n: 75,
      total: 100,
    };
    render(<ProgressBar state={state} />);

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("handles progress without total (indeterminate)", () => {
    const state: TqdmState = {
      ...defaultState,
      total: undefined,
    };
    render(<ProgressBar state={state} />);

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toHaveStyle({ width: "0%" });
  });

  it("renders progress text", () => {
    render(<ProgressBar state={defaultState} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toBeInTheDocument();
    expect(textContainer).toHaveTextContent("50%");
  });

  it("handles state with prefix", () => {
    const state: TqdmState = {
      ...defaultState,
      prefix: "Processing",
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toHaveTextContent("Processing:");
  });

  it("handles state with postfix", () => {
    const state: TqdmState = {
      ...defaultState,
      postfix: " items/sec",
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toHaveTextContent("items/sec");
  });

  it("handles state with unit scaling", () => {
    const state: TqdmState = {
      ...defaultState,
      unit_scale: true,
      n: 1500,
      total: 3000,
    };
    render(<ProgressBar state={state} />);

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("handles state with custom unit", () => {
    const state: TqdmState = {
      ...defaultState,
      unit: "files",
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toHaveTextContent("files");
  });

  it("handles rate calculation", () => {
    const state: TqdmState = {
      ...defaultState,
      rate: 5.5,
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toBeInTheDocument();
    // Rate should be displayed in the text
  });

  it("handles completion state", () => {
    const state: TqdmState = {
      ...defaultState,
      n: 100,
      total: 100,
    };
    render(<ProgressBar state={state} />);

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toHaveStyle({ width: "100%" });
  });

  it("handles edge case with n greater than total", () => {
    const state: TqdmState = {
      ...defaultState,
      n: 150,
      total: 100,
    };
    render(<ProgressBar state={state} />);

    const progressBar = document.querySelector(".reacttqdm-progress");
    expect(progressBar).toHaveStyle({ width: "150%" });
  });

  it("handles zero elapsed time", () => {
    const state: TqdmState = {
      ...defaultState,
      elapsed: 0,
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toBeInTheDocument();
  });

  it("passes through HTML attributes", () => {
    render(
      <ProgressBar
        state={defaultState}
        data-testid="progress-bar"
        style={{ marginTop: "10px" }}
      />
    );

    const container = screen.getByTestId("progress-bar");
    expect(container).toHaveStyle({ marginTop: "10px" });
  });

  it("handles complex postfix object", () => {
    const state: TqdmState = {
      ...defaultState,
      postfix: { loss: "0.123", acc: "0.456" },
    };
    render(<ProgressBar state={state} />);

    const textContainer = document.querySelector(".reacttqdm-text");
    expect(textContainer).toBeInTheDocument();
  });
});
