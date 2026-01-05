import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import FullScreenComponent from "./fullscreenelement";

// Mock the fullscreen API
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();
const mockMozRequestFullScreen = vi.fn();
const mockWebkitRequestFullscreen = vi.fn();
const mockMsRequestFullscreen = vi.fn();
const mockMozCancelFullScreen = vi.fn();
const mockWebkitExitFullscreen = vi.fn();
const mockMsExitFullscreen = vi.fn();

// Mock console methods - created fresh for each test
let mockConsoleError: any;
let mockConsoleWarn: any;

// Helper to setup fullscreen API mocks
const setupFullscreenMocks = (modernSupport = true, vendorSupport = false) => {
  Object.defineProperty(HTMLDivElement.prototype, "requestFullscreen", {
    value: modernSupport ? mockRequestFullscreen : undefined,
    writable: true,
    configurable: true,
  });

  if (vendorSupport) {
    Object.defineProperty(HTMLDivElement.prototype, "mozRequestFullScreen", {
      value: mockMozRequestFullScreen,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(HTMLDivElement.prototype, "webkitRequestFullscreen", {
      value: mockWebkitRequestFullscreen,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(HTMLDivElement.prototype, "msRequestFullscreen", {
      value: mockMsRequestFullscreen,
      writable: true,
      configurable: true,
    });
  }

  Object.defineProperty(document, "exitFullscreen", {
    value: modernSupport ? mockExitFullscreen : undefined,
    writable: true,
    configurable: true,
  });

  if (vendorSupport) {
    Object.defineProperty(document, "mozCancelFullScreen", {
      value: mockMozCancelFullScreen,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, "webkitExitFullscreen", {
      value: mockWebkitExitFullscreen,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, "msExitFullscreen", {
      value: mockMsExitFullscreen,
      writable: true,
      configurable: true,
    });
  }
};

// Helper to simulate fullscreen state
const simulateFullscreenState = (isFullscreen: boolean, element?: Element) => {
  Object.defineProperty(document, "fullscreenElement", {
    value: isFullscreen ? element || document.body : null,
    writable: true,
    configurable: true,
  });

  // Also clear vendor properties when not fullscreen
  if (!isFullscreen) {
    Object.defineProperty(document, "webkitFullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, "mozFullScreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, "msFullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
  }
};

// Helper to trigger fullscreen change events
const triggerFullscreenChangeEvent = (eventType = "fullscreenchange") => {
  const event = new Event(eventType);
  document.dispatchEvent(event);
};

describe("FullScreenComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create fresh console mocks for each test
    mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setupFullscreenMocks(true, false);
    simulateFullscreenState(false);
  });

  afterEach(() => {
    // Clean up any fullscreen state
    simulateFullscreenState(false);
    // Restore console mocks
    mockConsoleError?.mockRestore?.();
    mockConsoleWarn?.mockRestore?.();
  });

  describe("Basic Rendering", () => {
    it("should render children correctly", () => {
      render(
        <FullScreenComponent>
          <div data-testid="content">Test content</div>
        </FullScreenComponent>
      );

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should apply className and style props", () => {
      render(
        <FullScreenComponent
          className="test-class"
          style={{ backgroundColor: "rgb(255, 0, 0)" }}
          data-testid="fullscreen-container"
        >
          <div>Content</div>
        </FullScreenComponent>
      );

      const container = screen.getByTestId("fullscreen-container");
      expect(container).toHaveClass("test-class");
      expect(container).toHaveStyle("background-color: rgb(255, 0, 0)");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <FullScreenComponent ref={ref}>
          <div>Content</div>
        </FullScreenComponent>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("asChild Prop", () => {
    it("should render as child element when asChild is true", () => {
      render(
        <FullScreenComponent asChild>
          <div data-testid="child-element" className="child-class">
            Child content
          </div>
        </FullScreenComponent>
      );

      const childElement = screen.getByTestId("child-element");
      expect(childElement).toBeInTheDocument();
      expect(childElement).toHaveClass("child-class");
    });

    it("should merge className and style with child element", () => {
      render(
        <FullScreenComponent
          asChild
          className="parent-class"
          style={{ color: "rgb(0, 0, 255)" }}
        >
          <div
            data-testid="child-element"
            className="child-class"
            style={{ fontSize: "16px" }}
          >
            Child content
          </div>
        </FullScreenComponent>
      );

      const childElement = screen.getByTestId("child-element");
      expect(childElement).toHaveClass("child-class", "parent-class");
      expect(childElement).toHaveStyle("color: rgb(0, 0, 255)");
      expect(childElement).toHaveStyle("font-size: 16px");
    });
  });

  describe("Compound Components", () => {
    describe("Trigger", () => {
      it("should render trigger correctly", () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.Trigger>
              <button data-testid="trigger-button">Toggle</button>
            </FullScreenComponent.Trigger>
          </FullScreenComponent>
        );

        expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
      });

      it("should have proper accessibility attributes", () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.Trigger>
              <span>Toggle</span>
            </FullScreenComponent.Trigger>
          </FullScreenComponent>
        );

        const trigger = screen.getByRole("button");
        expect(trigger).toHaveAttribute("tabIndex", "0");
        expect(trigger).toHaveStyle({ cursor: "pointer" });
      });

      it("should apply className to trigger", () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.Trigger className="trigger-class">
              <span>Toggle</span>
            </FullScreenComponent.Trigger>
          </FullScreenComponent>
        );

        expect(screen.getByRole("button")).toHaveClass("trigger-class");
      });

      it("should throw error when used outside FullScreen context", () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        expect(() => {
          render(
            <FullScreenComponent.Trigger>
              <span>Toggle</span>
            </FullScreenComponent.Trigger>
          );
        }).toThrow(
          "FullScreen.Trigger must be used within a FullScreen component"
        );

        consoleError.mockRestore();
      });
    });

    describe("InFullScreen", () => {
      it("should not render when not in fullscreen", () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.InFullScreen>
              <div data-testid="fullscreen-content">Fullscreen content</div>
            </FullScreenComponent.InFullScreen>
          </FullScreenComponent>
        );

        expect(
          screen.queryByTestId("fullscreen-content")
        ).not.toBeInTheDocument();
      });

      it("should render when in fullscreen", async () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.Trigger>
              <button data-testid="trigger">Toggle</button>
            </FullScreenComponent.Trigger>
            <FullScreenComponent.InFullScreen>
              <div data-testid="fullscreen-content">Fullscreen content</div>
            </FullScreenComponent.InFullScreen>
          </FullScreenComponent>
        );

        // Trigger fullscreen
        fireEvent.click(screen.getByTestId("trigger"));

        // Wait for requestFullscreen to be called
        await waitFor(() => {
          expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
        });

        // Simulate fullscreen state change
        simulateFullscreenState(true);
        triggerFullscreenChangeEvent();

        await waitFor(() => {
          expect(screen.getByTestId("fullscreen-content")).toBeInTheDocument();
        });
      });

      it("should throw error when used outside FullScreen context", () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        expect(() => {
          render(
            <FullScreenComponent.InFullScreen>
              <div>Content</div>
            </FullScreenComponent.InFullScreen>
          );
        }).toThrow(
          "FullScreen.InFullScreen must be used within a FullScreen component"
        );

        consoleError.mockRestore();
      });
    });

    describe("OutFullScreen", () => {
      it("should render when not in fullscreen", () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.OutFullScreen>
              <div data-testid="normal-content">Normal content</div>
            </FullScreenComponent.OutFullScreen>
          </FullScreenComponent>
        );

        expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      });

      it("should not render when in fullscreen", async () => {
        render(
          <FullScreenComponent>
            <FullScreenComponent.Trigger>
              <button data-testid="trigger">Toggle</button>
            </FullScreenComponent.Trigger>
            <FullScreenComponent.OutFullScreen>
              <div data-testid="normal-content">Normal content</div>
            </FullScreenComponent.OutFullScreen>
          </FullScreenComponent>
        );

        expect(screen.getByTestId("normal-content")).toBeInTheDocument();

        // Trigger fullscreen
        fireEvent.click(screen.getByTestId("trigger"));

        // Wait for requestFullscreen to be called
        await waitFor(() => {
          expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
        });

        // Simulate fullscreen state change
        simulateFullscreenState(true);
        triggerFullscreenChangeEvent();

        await waitFor(() => {
          expect(
            screen.queryByTestId("normal-content")
          ).not.toBeInTheDocument();
        });
      });

      it("should throw error when used outside FullScreen context", () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        expect(() => {
          render(
            <FullScreenComponent.OutFullScreen>
              <div>Content</div>
            </FullScreenComponent.OutFullScreen>
          );
        }).toThrow(
          "FullScreen.OutFullScreen must be used within a FullScreen component"
        );

        consoleError.mockRestore();
      });
    });
  });

  describe("Fullscreen Functionality", () => {
    it("should request fullscreen when trigger is clicked", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
      });
    });

    it("should exit fullscreen when trigger is clicked in fullscreen mode", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      // First click to enter fullscreen
      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
      });

      // Simulate entering fullscreen state
      simulateFullscreenState(true);
      triggerFullscreenChangeEvent();

      // Wait for state to update
      await waitFor(() => {
        // Give time for the component to update its internal state
      });

      // Second click to exit fullscreen
      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockExitFullscreen).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle keyboard interaction on trigger", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      const trigger = screen.getByTestId("trigger");

      // Test Enter key
      fireEvent.keyDown(trigger, { key: "Enter" });
      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
      });

      // Test Space key
      fireEvent.keyDown(trigger, { key: " " });
      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(2);
      });

      // Test other keys (should not trigger)
      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(mockRequestFullscreen).toHaveBeenCalledTimes(2);
    });

    it("should handle external fullscreen changes", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.InFullScreen>
            <div data-testid="fullscreen-content">Fullscreen content</div>
          </FullScreenComponent.InFullScreen>
          <FullScreenComponent.OutFullScreen>
            <div data-testid="normal-content">Normal content</div>
          </FullScreenComponent.OutFullScreen>
        </FullScreenComponent>
      );

      // Initially should show normal content
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("fullscreen-content")
      ).not.toBeInTheDocument();

      // Simulate external fullscreen change (e.g., F11 key)
      simulateFullscreenState(true);
      triggerFullscreenChangeEvent("fullscreenchange");

      await waitFor(() => {
        expect(screen.getByTestId("fullscreen-content")).toBeInTheDocument();
        expect(screen.queryByTestId("normal-content")).not.toBeInTheDocument();
      });

      // Simulate external exit from fullscreen (e.g., ESC key)
      simulateFullscreenState(false);
      triggerFullscreenChangeEvent("fullscreenchange");

      await waitFor(() => {
        expect(screen.getByTestId("normal-content")).toBeInTheDocument();
        expect(
          screen.queryByTestId("fullscreen-content")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Cross-Browser Compatibility", () => {
    it("should use Mozilla fullscreen API when modern API is not available", async () => {
      setupFullscreenMocks(false, true);

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockMozRequestFullScreen).toHaveBeenCalledTimes(1);
      });
    });

    it("should use WebKit fullscreen API", async () => {
      // Clear all mock call counts first
      vi.clearAllMocks();

      // Remove all APIs except webkit
      Object.defineProperty(HTMLDivElement.prototype, "requestFullscreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(HTMLDivElement.prototype, "mozRequestFullScreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(HTMLDivElement.prototype, "msRequestFullscreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(
        HTMLDivElement.prototype,
        "webkitRequestFullscreen",
        {
          value: mockWebkitRequestFullscreen,
          writable: true,
          configurable: true,
        }
      );

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockWebkitRequestFullscreen).toHaveBeenCalledTimes(1);
      });
    });

    it("should use MS fullscreen API", async () => {
      // Remove modern API and set MS API
      Object.defineProperty(HTMLDivElement.prototype, "requestFullscreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(HTMLDivElement.prototype, "mozRequestFullScreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(
        HTMLDivElement.prototype,
        "webkitRequestFullscreen",
        {
          value: undefined,
          writable: true,
          configurable: true,
        }
      );
      Object.defineProperty(HTMLDivElement.prototype, "msRequestFullscreen", {
        value: mockMsRequestFullscreen,
        writable: true,
        configurable: true,
      });

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockMsRequestFullscreen).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle vendor-prefixed fullscreen change events", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.InFullScreen>
            <div data-testid="fullscreen-content">Fullscreen content</div>
          </FullScreenComponent.InFullScreen>
          <FullScreenComponent.OutFullScreen>
            <div data-testid="normal-content">Normal content</div>
          </FullScreenComponent.OutFullScreen>
        </FullScreenComponent>
      );

      // Initially should show normal content
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("fullscreen-content")
      ).not.toBeInTheDocument();

      // Test webkit event
      simulateFullscreenState(true);
      triggerFullscreenChangeEvent("webkitfullscreenchange");

      await waitFor(() => {
        expect(screen.getByTestId("fullscreen-content")).toBeInTheDocument();
      });

      // Test mozilla event
      simulateFullscreenState(false);
      triggerFullscreenChangeEvent("mozfullscreenchange");

      await waitFor(() => {
        expect(
          screen.queryByTestId("fullscreen-content")
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      });

      // Test MS event
      simulateFullscreenState(true);
      triggerFullscreenChangeEvent("MSFullscreenChange");

      await waitFor(() => {
        expect(screen.getByTestId("fullscreen-content")).toBeInTheDocument();
      });
    });

    it("should detect fullscreen state from vendor-prefixed properties", async () => {
      render(
        <FullScreenComponent>
          <FullScreenComponent.InFullScreen>
            <div data-testid="fullscreen-content">Fullscreen content</div>
          </FullScreenComponent.InFullScreen>
          <FullScreenComponent.OutFullScreen>
            <div data-testid="normal-content">Normal content</div>
          </FullScreenComponent.OutFullScreen>
        </FullScreenComponent>
      );

      // Initially should show normal content
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("fullscreen-content")
      ).not.toBeInTheDocument();

      // Clear standard fullscreen element and set webkit fullscreen element
      Object.defineProperty(document, "fullscreenElement", {
        value: null,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, "webkitFullscreenElement", {
        value: document.body,
        writable: true,
        configurable: true,
      });

      triggerFullscreenChangeEvent("webkitfullscreenchange");

      await waitFor(() => {
        expect(screen.getByTestId("fullscreen-content")).toBeInTheDocument();
        expect(screen.queryByTestId("normal-content")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing element reference gracefully", async () => {
      const TestComponent = () => {
        const [shouldRender, setShouldRender] = React.useState(true);

        return (
          <div>
            {shouldRender && (
              <FullScreenComponent>
                <FullScreenComponent.Trigger>
                  <button data-testid="trigger">Toggle</button>
                </FullScreenComponent.Trigger>
              </FullScreenComponent>
            )}
            <button data-testid="remove" onClick={() => setShouldRender(false)}>
              Remove
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      // Remove the component to make ref.current null
      fireEvent.click(screen.getByTestId("remove"));

      // This should not throw an error
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it("should log error when fullscreen API fails", async () => {
      mockRequestFullscreen.mockRejectedValueOnce(
        new Error("Fullscreen failed")
      );

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
      });

      // Give time for error handling
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          "FullScreen: Error toggling fullscreen mode",
          expect.any(Error)
        );
      });
    });

    it("should throw error when no fullscreen API is supported", async () => {
      // Remove all fullscreen APIs
      Object.defineProperty(HTMLDivElement.prototype, "requestFullscreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(HTMLDivElement.prototype, "mozRequestFullScreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(
        HTMLDivElement.prototype,
        "webkitRequestFullscreen",
        {
          value: undefined,
          writable: true,
          configurable: true,
        }
      );
      Object.defineProperty(HTMLDivElement.prototype, "msRequestFullscreen", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      fireEvent.click(screen.getByTestId("trigger"));

      // Wait for the async toggle function to complete
      await waitFor(
        () => {
          expect(mockConsoleError).toHaveBeenCalledWith(
            "FullScreen: Error toggling fullscreen mode",
            expect.objectContaining({
              message: "Fullscreen API is not supported in this browser",
            })
          );
        },
        { timeout: 2000 }
      );
    });

    it("should handle exit fullscreen API errors", async () => {
      mockExitFullscreen.mockRejectedValueOnce(new Error("Exit failed"));

      render(
        <FullScreenComponent>
          <FullScreenComponent.Trigger>
            <button data-testid="trigger">Toggle</button>
          </FullScreenComponent.Trigger>
        </FullScreenComponent>
      );

      // Enter fullscreen first
      fireEvent.click(screen.getByTestId("trigger"));
      simulateFullscreenState(true);
      triggerFullscreenChangeEvent();

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
      });

      // Wait for state to update to fullscreen
      await waitFor(() => {
        // State should be updated by now
      });

      // Try to exit fullscreen
      fireEvent.click(screen.getByTestId("trigger"));

      await waitFor(() => {
        expect(mockExitFullscreen).toHaveBeenCalledTimes(1);
      });

      // Wait for error handling
      await waitFor(
        () => {
          expect(mockConsoleError).toHaveBeenCalledWith(
            "FullScreen: Error toggling fullscreen mode",
            expect.any(Error)
          );
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Memory Leaks and Cleanup", () => {
    it("should clean up event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = render(
        <FullScreenComponent>
          <div>Content</div>
        </FullScreenComponent>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "fullscreenchange",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "webkitfullscreenchange",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "mozfullscreenchange",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "MSFullscreenChange",
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
