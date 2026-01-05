import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  KeyPressProvider,
  useKeyPress,
  useKeyboardShortcuts,
} from "./keypress-provider";

import { TestKeys, MockEventTarget } from "./keypress-provider.test-utils";

describe("KeyPressProvider Performance Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Memory Management", () => {
    it("should not create memory leaks with rapid mount/unmount cycles", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const TestComponent = () => {
        useKeyPress();
        return <div>Test</div>;
      };

      // Rapid mount/unmount cycles
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <KeyPressProvider key={i}>
            <TestComponent />
          </KeyPressProvider>
        );
        unmount();
      }

      // Should have equal number of add and remove calls
      const addCalls = addEventListenerSpy.mock.calls.length;
      const removeCalls = removeEventListenerSpy.mock.calls.length;

      expect(removeCalls).toBeGreaterThan(0);
      // Each mount should have corresponding unmount cleanup
      expect(Math.abs(addCalls - removeCalls)).toBeLessThanOrEqual(4); // 4 event types per provider
    });

    it("should handle many simultaneous providers without memory issues", () => {
      const TestComponent: React.FC<{ id: number }> = ({ id }) => {
        const { keys } = useKeyPress();
        return <div data-testid={`provider-${id}`}>{keys.size}</div>;
      };

      const providers = Array.from({ length: 50 }, (_, i) => (
        <KeyPressProvider key={i}>
          <TestComponent id={i} />
        </KeyPressProvider>
      ));

      render(<div>{providers}</div>);

      // Trigger key events - all providers should handle without issues
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      // All providers should show the key
      for (let i = 0; i < 50; i++) {
        expect(screen.getByTestId(`provider-${i}`)).toHaveTextContent("1");
      }
    });

    it("should clean up event listeners properly on unmount", () => {
      const mockTarget = new MockEventTarget();

      const { unmount } = render(
        <KeyPressProvider target={mockTarget as any}>
          <div>Test</div>
        </KeyPressProvider>
      );

      // Should have listeners attached
      expect(mockTarget.getListenerCount()).toBeGreaterThan(0);

      unmount();

      // Should clean up all listeners
      expect(mockTarget.getListenerCount()).toBe(0);
    });
  });

  describe("Event Handling Performance", () => {
    it("should handle rapid key events efficiently", () => {
      const onKeyStateChange = vi.fn();

      const TestComponent = () => {
        const keyState = useKeyPress();

        React.useEffect(() => {
          onKeyStateChange(keyState.keys.size);
        }, [keyState.keys]);

        return <div data-testid="key-count">{keyState.keys.size}</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Simulate rapid key events (100 events in quick succession)
      const keys = TestKeys.LETTERS.slice(0, 10); // Use first 10 letters

      act(() => {
        for (let i = 0; i < 100; i++) {
          const key = keys[i % keys.length];
          fireEvent.keyDown(window, { key });
          if (i % 2 === 0) {
            fireEvent.keyUp(window, { key: keys[(i - 1) % keys.length] });
          }
        }
      });

      // Component should still be responsive
      expect(screen.getByTestId("key-count")).toBeInTheDocument();

      // Should not have excessive state updates
      expect(onKeyStateChange.mock.calls.length).toBeLessThan(200); // Much less than 1000 events
    });

    it("should handle large numbers of simultaneous keys efficiently", () => {
      const TestComponent = () => {
        const { keys } = useKeyPress();
        return <div data-testid="key-count">{keys.size}</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Press many keys simultaneously
      const allKeys = [
        ...TestKeys.LETTERS,
        ...TestKeys.NUMBERS,
        ...TestKeys.FUNCTION_KEYS,
        ...TestKeys.ARROW_KEYS,
        ...TestKeys.MODIFIER_KEYS,
      ];

      act(() => {
        allKeys.forEach((key) => {
          fireEvent.keyDown(window, { key });
        });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent(
        allKeys.length.toString()
      );

      // Release all keys
      act(() => {
        allKeys.forEach((key) => {
          fireEvent.keyUp(window, { key });
        });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
    });

    it("should optimize repeated key down events", () => {
      const onKeyStateChange = vi.fn();

      const TestComponent = () => {
        const keyState = useKeyPress();

        React.useEffect(() => {
          onKeyStateChange(keyState);
        }, [keyState]);

        return <div>Test</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Simulate key repeat (same key down multiple times)
      act(() => {
        for (let i = 0; i < 100; i++) {
          fireEvent.keyDown(window, { key: "a" });
        }
      });

      // Should only trigger state change once for the first keydown
      expect(onKeyStateChange).toHaveBeenCalledTimes(2); // Initial render + first keydown
    });
  });

  describe("Shortcut Performance", () => {
    it("should handle many keyboard shortcuts efficiently", () => {
      const shortcutCallbacks = Array.from({ length: 100 }, () => vi.fn());

      const TestComponent = () => {
        const shortcuts = Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `Control+${String.fromCharCode(97 + (i % 26))}+${i}`, // Control+a+0, Control+b+1, etc.
            shortcutCallbacks[i],
          ])
        );

        useKeyboardShortcuts(shortcuts);
        return <div>Test Shortcuts</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Trigger a specific shortcut
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "0" });
      });

      expect(shortcutCallbacks[0]).toHaveBeenCalled();

      // Other shortcuts should not be triggered
      for (let i = 1; i < 100; i++) {
        expect(shortcutCallbacks[i]).not.toHaveBeenCalled();
      }
    });

    it("should handle complex shortcut combinations without performance degradation", () => {
      const onShortcut = vi.fn();

      const ComplexShortcutComponent = () => {
        useKeyboardShortcuts({
          "Control+Shift+Alt+Meta+a": () => onShortcut("complex1"),
          "Control+Shift+Alt+Meta+b": () => onShortcut("complex2"),
          "Control+Shift+Alt+Meta+c": () => onShortcut("complex3"),
        });

        return <div>Complex Shortcuts</div>;
      };

      render(
        <KeyPressProvider>
          <ComplexShortcutComponent />
        </KeyPressProvider>
      );

      const start = performance.now();

      // Trigger complex shortcut
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "Shift" });
        fireEvent.keyDown(window, { key: "Alt" });
        fireEvent.keyDown(window, { key: "Meta" });
        fireEvent.keyDown(window, { key: "a" });
      });

      const end = performance.now();

      expect(onShortcut).toHaveBeenCalledWith("complex1");

      // Should complete within reasonable time (less than 10ms)
      expect(end - start).toBeLessThan(10);
    });
  });

  describe("Re-render Optimization", () => {
    it("should minimize unnecessary re-renders", () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        useKeyPress(); // Call hook to ensure it's used, but don't destructure unused variable
        return <div data-testid="render-count">{renderCount}</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      const initialRenderCount = renderCount;

      // Multiple identical state changes should not cause extra renders
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "a" }); // Duplicate
        fireEvent.keyDown(window, { key: "a" }); // Duplicate
      });

      expect(renderCount).toBe(initialRenderCount + 1); // Only one additional render

      // Key up should cause another render
      act(() => {
        fireEvent.keyUp(window, { key: "a" });
      });

      expect(renderCount).toBe(initialRenderCount + 2);
    });

    it("should use stable references for context value methods", () => {
      const contextValues: any[] = [];

      const TestComponent = () => {
        const keyState = useKeyPress();
        contextValues.push(keyState);
        return <div>Test</div>;
      };

      const { rerender } = render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Force re-render without state change
      rerender(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      expect(contextValues.length).toBeGreaterThanOrEqual(2);

      // Method references should be stable
      expect(contextValues[0].isKeyPressed).toBe(contextValues[1].isKeyPressed);
      expect(contextValues[0].areKeysPressed).toBe(
        contextValues[1].areKeysPressed
      );
      expect(contextValues[0].isAnyKeyPressed).toBe(
        contextValues[1].isAnyKeyPressed
      );
    });
  });

  describe("Edge Case Performance", () => {
    it("should handle window blur with many active keys efficiently", () => {
      const TestComponent = () => {
        const { keys } = useKeyPress();
        return <div data-testid="key-count">{keys.size}</div>;
      };

      render(
        <KeyPressProvider debug>
          <TestComponent />
        </KeyPressProvider>
      );

      // Press many keys
      act(() => {
        TestKeys.LETTERS.forEach((key) => {
          fireEvent.keyDown(window, { key });
        });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent(
        TestKeys.LETTERS.length.toString()
      );

      const start = performance.now();

      // Trigger blur - should clear all keys efficiently
      act(() => {
        fireEvent.blur(window);
      });

      const end = performance.now();

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
      expect(end - start).toBeLessThan(5); // Should be very fast
    });

    it("should handle visibility change efficiently", () => {
      const TestComponent = () => {
        const { keys } = useKeyPress();
        return <div data-testid="key-count">{keys.size}</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Press keys
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "b" });
        fireEvent.keyDown(window, { key: "c" });
      });

      const start = performance.now();

      // Hide tab
      act(() => {
        Object.defineProperty(document, "hidden", {
          writable: true,
          value: true,
        });
        fireEvent(document, new Event("visibilitychange"));
      });

      const end = performance.now();

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
      expect(end - start).toBeLessThan(5);
    });

    it("should handle rapid mount/unmount cycles without degradation", () => {
      const mountTimes: number[] = [];
      const unmountTimes: number[] = [];

      for (let i = 0; i < 20; i++) {
        const mountStart = performance.now();

        const { unmount } = render(
          <KeyPressProvider key={i}>
            <div>Test {i}</div>
          </KeyPressProvider>
        );

        const mountEnd = performance.now();
        mountTimes.push(mountEnd - mountStart);

        const unmountStart = performance.now();
        unmount();
        const unmountEnd = performance.now();
        unmountTimes.push(unmountEnd - unmountStart);
      }

      // Mount times should not increase significantly over iterations
      const firstMountTime = mountTimes[0];
      const lastMountTime = mountTimes[mountTimes.length - 1];
      expect(lastMountTime).toBeLessThan(firstMountTime * 2); // No more than 2x slower

      // Unmount times should remain consistent
      const firstUnmountTime = unmountTimes[0];
      const lastUnmountTime = unmountTimes[unmountTimes.length - 1];
      expect(lastUnmountTime).toBeLessThan(firstUnmountTime * 2);
    });
  });

  describe("Concurrent Features", () => {
    it("should handle concurrent updates efficiently", () => {
      const TestComponent = () => {
        const { keys } = useKeyPress();
        return <div data-testid="key-count">{keys.size}</div>;
      };

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Simulate concurrent key events synchronously
      act(() => {
        for (let i = 0; i < 50; i++) {
          fireEvent.keyDown(window, {
            key: String.fromCharCode(97 + (i % 26)),
          });
        }
      });

      // Should handle all concurrent updates without issues
      const finalCount = parseInt(
        screen.getByTestId("key-count").textContent || "0"
      );
      expect(finalCount).toBeGreaterThan(0);
      expect(finalCount).toBeLessThanOrEqual(26); // Can't exceed unique keys
    });

    it("should handle providers with different configurations efficiently", () => {
      const TestApp = () => (
        <div>
          <KeyPressProvider debug={true} preventDefault={false}>
            <div data-testid="provider1">Provider 1</div>
          </KeyPressProvider>

          <KeyPressProvider
            debug={false}
            preventDefault={true}
            ignoredKeys={["Tab"]}
          >
            <div data-testid="provider2">Provider 2</div>
          </KeyPressProvider>

          <KeyPressProvider target={new MockEventTarget() as any}>
            <div data-testid="provider3">Provider 3</div>
          </KeyPressProvider>
        </div>
      );

      const start = performance.now();
      render(<TestApp />);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should render quickly

      expect(screen.getByTestId("provider1")).toBeInTheDocument();
      expect(screen.getByTestId("provider2")).toBeInTheDocument();
      expect(screen.getByTestId("provider3")).toBeInTheDocument();
    });
  });
});
