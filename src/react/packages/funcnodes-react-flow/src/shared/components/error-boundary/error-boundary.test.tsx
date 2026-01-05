import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "./index";

const Bomb: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Boom");
  }
  return <div>Safe</div>;
};

type FallbackProps = {
  error: Error | null;
  label?: string;
  count?: number;
};

const Fallback: React.FC<FallbackProps> = ({ error, label, count }) => {
  return (
    <div data-testid="fallback">
      {label}-{count}-{error?.message}
    </div>
  );
};

describe("ErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("Safe")).toBeInTheDocument();
  });

  it("renders fallback component with merged props and calls onError", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary<FallbackProps>
        fallback={Fallback}
        fallbackProps={{ label: "from-fallback", count: 1 }}
        label="from-pass-through"
        count={2}
        onError={onError}
      >
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    const fallback = screen.getByTestId("fallback");
    expect(fallback).toHaveTextContent("from-pass-through-2-Boom");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("renders fallback element when provided", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback-el">Fallback</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("fallback-el")).toBeInTheDocument();
  });

  it("renders null when no fallback is provided", () => {
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
