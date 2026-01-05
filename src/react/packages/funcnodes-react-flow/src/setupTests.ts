// This file is loaded automatically by vitest before running tests
// Add any global test setup here

// Import Jest DOM matchers for testing-library
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Ensure cleanup runs after each test to prevent test pollution
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver globally for components that use it
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Mock matchMedia for components that use it
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Mock console methods if needed
// global.console = {
//   ...console,
//   // Uncomment to ignore specific console outputs during tests
//   // log: vi.fn(),
//   // warn: vi.fn(),
//   // error: vi.fn(),
// };

// Global test utilities or mocks can be added here

export {};
