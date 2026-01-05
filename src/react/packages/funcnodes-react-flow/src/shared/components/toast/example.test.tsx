// @vitest-environment happy-dom
import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ToastExample } from "./example";

describe("ToastExample", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows default, success, error, and action toasts", async () => {
    render(<ToastExample />);

    fireEvent.click(screen.getByText("Show Default"));
    expect(
      await screen.findByText("This is a default toast message.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Show Success"));
    expect(await screen.findByText("Success!")).toBeInTheDocument();
    expect(
      await screen.findByText("Your changes have been saved successfully.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Show Error"));
    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Show with Action"));
    const undo = await screen.findByText("Undo");
    fireEvent.click(undo);
    expect(await screen.findByText("Action undone!")).toBeInTheDocument();
  });

  it("schedules stacked toasts for the demo button", () => {
    vi.useFakeTimers();
    render(<ToastExample />);

    fireEvent.click(screen.getByText("Show Multiple (Stack Demo)"));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Toast 6")).toBeInTheDocument();
  });
});
