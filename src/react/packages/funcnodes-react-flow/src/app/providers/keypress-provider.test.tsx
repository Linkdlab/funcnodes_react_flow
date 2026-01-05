import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  renderHook,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  KeyPressProvider,
  useKeyPress,
  useIsKeyPressed,
  useKeyboardShortcuts,
  withKeyPress,
  Keys,
  type KeyPressState,
} from "./keypress-provider";

// Test component that uses the keypress hooks
const TestComponent: React.FC<{
  onKeyState?: (state: KeyPressState) => void;
  targetKey?: string;
}> = ({ onKeyState, targetKey }) => {
  const keyState = useKeyPress();
  const isTargetKeyPressed = useIsKeyPressed(targetKey || "a");

  React.useEffect(() => {
    onKeyState?.(keyState);
  }, [keyState, onKeyState]);

  return (
    <div>
      <div data-testid="pressed-keys">
        {Array.from(keyState.keys).join(", ")}
      </div>
      <div data-testid="key-count">{keyState.keys.size}</div>
      <div data-testid="target-key-pressed">
        {isTargetKeyPressed.toString()}
      </div>
    </div>
  );
};

// HOC test component
const HOCTestComponent = withKeyPress<{ message: string }>(
  ({ keys, isKeyPressed, message }) => (
    <div>
      <div data-testid="hoc-message">{message}</div>
      <div data-testid="hoc-keys">{Array.from(keys).join(", ")}</div>
      <div data-testid="hoc-enter-pressed">
        {isKeyPressed("Enter").toString()}
      </div>
    </div>
  )
);

// Shortcuts test component
const ShortcutsTestComponent: React.FC<{
  onShortcut: (name: string) => void;
  enabled?: boolean;
}> = ({ onShortcut, enabled = true }) => {
  useKeyboardShortcuts(
    {
      "Control+s": () => onShortcut("save"),
      "Control+Shift+s": () => onShortcut("saveAs"),
      Escape: () => onShortcut("escape"),
      "Control+z": () => onShortcut("undo"),
    },
    enabled
  );

  return <div data-testid="shortcuts-component">Shortcuts Active</div>;
};

describe("KeyPressProvider", () => {
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("should provide initial empty key state", () => {
      const onKeyState = vi.fn();

      render(
        <KeyPressProvider>
          <TestComponent onKeyState={onKeyState} />
        </KeyPressProvider>
      );

      expect(onKeyState).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.any(Set),
          isKeyPressed: expect.any(Function),
          areKeysPressed: expect.any(Function),
          isAnyKeyPressed: expect.any(Function),
        })
      );

      const [keyState] = onKeyState.mock.calls[0];
      expect(keyState.keys.size).toBe(0);
      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
    });

    it("should track key down events", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("pressed-keys")).toHaveTextContent("a");
      expect(screen.getByTestId("key-count")).toHaveTextContent("1");
    });

    it("should track key up events", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");

      act(() => {
        fireEvent.keyUp(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
      expect(screen.getByTestId("pressed-keys")).toHaveTextContent("");
    });

    it("should handle multiple keys simultaneously", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "Shift" });
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("3");

      const pressedKeys = screen.getByTestId("pressed-keys").textContent;
      expect(pressedKeys).toContain("Control");
      expect(pressedKeys).toContain("Shift");
      expect(pressedKeys).toContain("a");
    });

    it("should not duplicate keys on repeated keydown events", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");
      expect(screen.getByTestId("pressed-keys")).toHaveTextContent("a");
    });
  });

  describe("KeyPressState Methods", () => {
    it("should correctly implement isKeyPressed", () => {
      const onKeyState = vi.fn();

      render(
        <KeyPressProvider>
          <TestComponent onKeyState={onKeyState} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Enter" });
      });

      const [keyState] =
        onKeyState.mock.calls[onKeyState.mock.calls.length - 1];
      expect(keyState.isKeyPressed("Enter")).toBe(true);
      expect(keyState.isKeyPressed("a")).toBe(false);
    });

    it("should correctly implement areKeysPressed", () => {
      const onKeyState = vi.fn();

      render(
        <KeyPressProvider>
          <TestComponent onKeyState={onKeyState} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "s" });
      });

      const [keyState] =
        onKeyState.mock.calls[onKeyState.mock.calls.length - 1];
      expect(keyState.areKeysPressed("Control", "s")).toBe(true);
      expect(keyState.areKeysPressed("Control", "s", "a")).toBe(false);
      expect(keyState.areKeysPressed("Control")).toBe(true);
    });

    it("should correctly implement isAnyKeyPressed", () => {
      const onKeyState = vi.fn();

      render(
        <KeyPressProvider>
          <TestComponent onKeyState={onKeyState} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      const [keyState] =
        onKeyState.mock.calls[onKeyState.mock.calls.length - 1];
      expect(keyState.isAnyKeyPressed("a", "b", "c")).toBe(true);
      expect(keyState.isAnyKeyPressed("x", "y", "z")).toBe(false);
    });
  });

  describe("Provider Configuration", () => {
    it("should prevent default when preventDefault is true", () => {
      const preventDefault = vi.fn();

      render(
        <KeyPressProvider preventDefault>
          <TestComponent />
        </KeyPressProvider>
      );

      // Create a proper keyboard event with preventDefault mock
      const keydownEvent = new KeyboardEvent("keydown", {
        key: "a",
        bubbles: true,
        cancelable: true,
      });
      keydownEvent.preventDefault = preventDefault;

      act(() => {
        window.dispatchEvent(keydownEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
    });

    it("should ignore specified keys", () => {
      render(
        <KeyPressProvider ignoredKeys={["Tab", "Alt"]}>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Tab" });
        fireEvent.keyDown(window, { key: "Alt" });
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");
      expect(screen.getByTestId("pressed-keys")).toHaveTextContent("a");
    });

    it("should log debug information when debug is true", () => {
      const consoleSpy = vi.spyOn(console, "log");

      render(
        <KeyPressProvider debug>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(consoleSpy).toHaveBeenCalledWith("[KeyPress] Key down: a");

      act(() => {
        fireEvent.keyUp(window, { key: "a" });
      });

      expect(consoleSpy).toHaveBeenCalledWith("[KeyPress] Key up: a");
    });

    it("should use custom target element", () => {
      const customElement = document.createElement("div");
      const addEventListenerSpy = vi.spyOn(customElement, "addEventListener");

      render(
        <KeyPressProvider target={customElement}>
          <TestComponent />
        </KeyPressProvider>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });
  });

  describe("Edge Cases and Cleanup", () => {
    it("should clear keys on window blur", () => {
      const consoleSpy = vi.spyOn(console, "log");

      render(
        <KeyPressProvider debug>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");

      act(() => {
        fireEvent.blur(window);
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[KeyPress] Window blur - clearing all keys"
      );
    });

    it("should clear keys on visibility change when hidden", () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Mock document.hidden
      Object.defineProperty(document, "hidden", {
        writable: true,
        value: false,
      });

      render(
        <KeyPressProvider debug>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");

      act(() => {
        Object.defineProperty(document, "hidden", { value: true });
        fireEvent(document, new Event("visibilitychange"));
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[KeyPress] Tab hidden - clearing all keys"
      );
    });

    it("should not clear keys on visibility change when visible", () => {
      Object.defineProperty(document, "hidden", {
        writable: true,
        value: false,
      });

      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");

      act(() => {
        fireEvent(document, new Event("visibilitychange"));
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");
    });

    it("should handle null target gracefully", () => {
      expect(() => {
        render(
          <KeyPressProvider target={null}>
            <TestComponent />
          </KeyPressProvider>
        );
      }).not.toThrow();
    });
  });

  describe("Hooks", () => {
    describe("useKeyPress", () => {
      it("should throw error when used outside provider", () => {
        // Suppress console error for this test
        const originalError = console.error;
        console.error = vi.fn();

        expect(() => {
          renderHook(() => useKeyPress());
        }).toThrow("useKeyPress must be used within a KeyPressProvider");

        console.error = originalError;
      });
    });

    describe("useIsKeyPressed", () => {
      it("should track specific key correctly", () => {
        render(
          <KeyPressProvider>
            <TestComponent targetKey="Enter" />
          </KeyPressProvider>
        );

        expect(screen.getByTestId("target-key-pressed")).toHaveTextContent(
          "false"
        );

        act(() => {
          fireEvent.keyDown(window, { key: "Enter" });
        });

        expect(screen.getByTestId("target-key-pressed")).toHaveTextContent(
          "true"
        );

        act(() => {
          fireEvent.keyUp(window, { key: "Enter" });
        });

        expect(screen.getByTestId("target-key-pressed")).toHaveTextContent(
          "false"
        );
      });
    });

    describe("useKeyboardShortcuts", () => {
      it("should trigger shortcuts correctly", () => {
        const onShortcut = vi.fn();

        render(
          <KeyPressProvider>
            <ShortcutsTestComponent onShortcut={onShortcut} />
          </KeyPressProvider>
        );

        // Test single key shortcut
        act(() => {
          fireEvent.keyDown(window, { key: "Escape" });
        });

        expect(onShortcut).toHaveBeenCalledWith("escape");

        // Test multi-key shortcut
        act(() => {
          fireEvent.keyUp(window, { key: "Escape" });
          fireEvent.keyDown(window, { key: "Control" });
          fireEvent.keyDown(window, { key: "s" });
        });

        expect(onShortcut).toHaveBeenCalledWith("save");

        // Test three-key shortcut
        act(() => {
          fireEvent.keyDown(window, { key: "Shift" });
        });

        expect(onShortcut).toHaveBeenCalledWith("saveAs");
      });

      it("should not trigger shortcuts when disabled", () => {
        const onShortcut = vi.fn();

        render(
          <KeyPressProvider>
            <ShortcutsTestComponent onShortcut={onShortcut} enabled={false} />
          </KeyPressProvider>
        );

        act(() => {
          fireEvent.keyDown(window, { key: "Escape" });
        });

        expect(onShortcut).not.toHaveBeenCalled();
      });

      it("should not trigger shortcuts with extra keys pressed", () => {
        const onShortcut = vi.fn();

        render(
          <KeyPressProvider>
            <ShortcutsTestComponent onShortcut={onShortcut} />
          </KeyPressProvider>
        );

        act(() => {
          fireEvent.keyDown(window, { key: "Control" });
          fireEvent.keyDown(window, { key: "s" });
          fireEvent.keyDown(window, { key: "a" }); // Extra key
        });

        expect(onShortcut).not.toHaveBeenCalledWith("save");
      });
    });
  });

  describe("Higher-Order Component", () => {
    it("should provide key press props to wrapped component", () => {
      render(
        <KeyPressProvider>
          <HOCTestComponent message="test" />
        </KeyPressProvider>
      );

      expect(screen.getByTestId("hoc-message")).toHaveTextContent("test");
      expect(screen.getByTestId("hoc-enter-pressed")).toHaveTextContent(
        "false"
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Enter" });
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("hoc-enter-pressed")).toHaveTextContent("true");
      expect(screen.getByTestId("hoc-keys")).toHaveTextContent("Enter, a");
    });
  });

  describe("Key Constants", () => {
    it("should provide correct key constants", () => {
      expect(Keys.ENTER).toBe("Enter");
      expect(Keys.ESCAPE).toBe("Escape");
      expect(Keys.SPACE).toBe(" ");
      expect(Keys.TAB).toBe("Tab");
      expect(Keys.BACKSPACE).toBe("Backspace");
      expect(Keys.DELETE).toBe("Delete");
      expect(Keys.ARROW_UP).toBe("ArrowUp");
      expect(Keys.ARROW_DOWN).toBe("ArrowDown");
      expect(Keys.ARROW_LEFT).toBe("ArrowLeft");
      expect(Keys.ARROW_RIGHT).toBe("ArrowRight");
      expect(Keys.SHIFT).toBe("Shift");
      expect(Keys.CONTROL).toBe("Control");
      expect(Keys.ALT).toBe("Alt");
      expect(Keys.META).toBe("Meta");
      expect(Keys.COMMAND).toBe("Meta");
      expect(Keys.CTRL).toBe("Control");
    });
  });

  describe("Performance and Memory", () => {
    it("should not recreate context value unnecessarily", () => {
      const TestMemoComponent = () => {
        const keyState = useKeyPress();
        const renderCount = React.useRef(0);
        renderCount.current++;

        React.useEffect(() => {
          // This effect should only run when keyState actually changes
        }, [keyState]);

        return <div data-testid="render-count">{renderCount.current}</div>;
      };

      render(
        <KeyPressProvider>
          <TestMemoComponent />
        </KeyPressProvider>
      );

      const initialRenderCount = parseInt(
        screen.getByTestId("render-count").textContent || "0"
      );

      // Re-render without state change shouldn't cause unnecessary renders
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
        fireEvent.keyDown(window, { key: "a" }); // Same key, should not cause extra render
      });

      const finalRenderCount = parseInt(
        screen.getByTestId("render-count").textContent || "0"
      );

      expect(finalRenderCount).toBe(initialRenderCount + 1); // Only one additional render for the key press
    });

    it("should properly cleanup event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "blur",
        expect.any(Function)
      );
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle rapid key sequences correctly", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      // Press and release keys in sequence
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("1");

      act(() => {
        fireEvent.keyDown(window, { key: "b" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("2");

      act(() => {
        fireEvent.keyUp(window, { key: "a" });
      });

      act(() => {
        fireEvent.keyDown(window, { key: "c" });
      });

      act(() => {
        fireEvent.keyUp(window, { key: "b" });
      });

      act(() => {
        fireEvent.keyUp(window, { key: "c" });
      });

      expect(screen.getByTestId("key-count")).toHaveTextContent("0");
    });

    it("should handle modifier keys correctly", () => {
      const onKeyState = vi.fn();

      render(
        <KeyPressProvider>
          <TestComponent onKeyState={onKeyState} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Control", ctrlKey: true });
        fireEvent.keyDown(window, { key: "Shift", shiftKey: true });
        fireEvent.keyDown(window, { key: "Alt", altKey: true });
      });

      const [keyState] =
        onKeyState.mock.calls[onKeyState.mock.calls.length - 1];
      expect(keyState.areKeysPressed("Control", "Shift", "Alt")).toBe(true);
    });

    it("should handle special characters and unicode correctly", () => {
      render(
        <KeyPressProvider>
          <TestComponent />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "é" });
        fireEvent.keyDown(window, { key: "€" });
        fireEvent.keyDown(window, { key: "한" });
      });

      const pressedKeys = screen.getByTestId("pressed-keys").textContent;
      expect(pressedKeys).toContain("é");
      expect(pressedKeys).toContain("€");
      expect(pressedKeys).toContain("한");
    });
  });
});
