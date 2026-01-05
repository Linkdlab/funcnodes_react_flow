import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  KeyPressProvider,
  useKeyPress,
  useKeyboardShortcuts,
  Keys,
} from "./keypress-provider";

// Example: Simple component that uses keyboard shortcuts
const ExampleComponent: React.FC<{
  onSave?: () => void;
  onCancel?: () => void;
}> = ({ onSave, onCancel }) => {
  const { keys, isKeyPressed } = useKeyPress();
  const [message, setMessage] = React.useState("");

  useKeyboardShortcuts({
    "Control+s": () => {
      onSave?.();
      setMessage("Saved!");
    },
    Escape: () => {
      onCancel?.();
      setMessage("Cancelled!");
    },
  });

  return (
    <div>
      <div data-testid="active-keys">
        Active keys: {Array.from(keys).join(", ")}
      </div>
      <div data-testid="ctrl-pressed">
        Ctrl pressed: {isKeyPressed("Control").toString()}
      </div>
      <div data-testid="message">{message}</div>
    </div>
  );
};

describe("KeyPress Provider Examples", () => {
  describe("Basic Usage", () => {
    it("should track individual key presses", () => {
      render(
        <KeyPressProvider>
          <ExampleComponent />
        </KeyPressProvider>
      );

      // Initially no keys pressed
      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys:"
      );
      expect(screen.getByTestId("ctrl-pressed")).toHaveTextContent(
        "Ctrl pressed: false"
      );

      // Press a key
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys: a"
      );

      // Release the key
      act(() => {
        fireEvent.keyUp(window, { key: "a" });
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys:"
      );
    });

    it("should track modifier keys", () => {
      render(
        <KeyPressProvider>
          <ExampleComponent />
        </KeyPressProvider>
      );

      // Press Control key
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
      });

      expect(screen.getByTestId("ctrl-pressed")).toHaveTextContent(
        "Ctrl pressed: true"
      );
      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys: Control"
      );

      // Release Control key
      act(() => {
        fireEvent.keyUp(window, { key: "Control" });
      });

      expect(screen.getByTestId("ctrl-pressed")).toHaveTextContent(
        "Ctrl pressed: false"
      );
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should trigger save shortcut with Ctrl+S", () => {
      const onSave = vi.fn();

      render(
        <KeyPressProvider>
          <ExampleComponent onSave={onSave} />
        </KeyPressProvider>
      );

      // Simulate Ctrl+S
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "s" });
      });

      expect(onSave).toHaveBeenCalled();
      expect(screen.getByTestId("message")).toHaveTextContent("Saved!");

      // Clean up
      act(() => {
        fireEvent.keyUp(window, { key: "s" });
        fireEvent.keyUp(window, { key: "Control" });
      });
    });

    it("should trigger cancel shortcut with Escape", () => {
      const onCancel = vi.fn();

      render(
        <KeyPressProvider>
          <ExampleComponent onCancel={onCancel} />
        </KeyPressProvider>
      );

      // Simulate Escape
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(onCancel).toHaveBeenCalled();
      expect(screen.getByTestId("message")).toHaveTextContent("Cancelled!");
    });

    it("should use key constants for better readability", () => {
      const onCancel = vi.fn();

      render(
        <KeyPressProvider>
          <ExampleComponent onCancel={onCancel} />
        </KeyPressProvider>
      );

      // Use the key constant instead of string
      act(() => {
        fireEvent.keyDown(window, { key: Keys.ESCAPE });
      });

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Provider Configuration", () => {
    it("should ignore specified keys", () => {
      render(
        <KeyPressProvider ignoredKeys={["Tab"]}>
          <ExampleComponent />
        </KeyPressProvider>
      );

      // Press Tab key (should be ignored)
      act(() => {
        fireEvent.keyDown(window, { key: "Tab" });
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys:"
      );

      // Press a normal key (should work)
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys: a"
      );
    });

    it("should clear keys on window blur", () => {
      render(
        <KeyPressProvider>
          <ExampleComponent />
        </KeyPressProvider>
      );

      // Press a key
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys: a"
      );

      // Blur window
      act(() => {
        fireEvent.blur(window);
      });

      expect(screen.getByTestId("active-keys")).toHaveTextContent(
        "Active keys:"
      );
    });
  });

  describe("Multiple Components", () => {
    const ComponentA = () => {
      const [triggered, setTriggered] = React.useState(false);

      useKeyboardShortcuts({
        "Control+1": () => setTriggered(true),
      });

      return (
        <div data-testid="component-a">
          {triggered ? "A triggered" : "A idle"}
        </div>
      );
    };

    const ComponentB = () => {
      const [triggered, setTriggered] = React.useState(false);

      useKeyboardShortcuts({
        "Control+2": () => setTriggered(true),
      });

      return (
        <div data-testid="component-b">
          {triggered ? "B triggered" : "B idle"}
        </div>
      );
    };

    it("should handle multiple components with different shortcuts", () => {
      render(
        <KeyPressProvider>
          <ComponentA />
          <ComponentB />
        </KeyPressProvider>
      );

      expect(screen.getByTestId("component-a")).toHaveTextContent("A idle");
      expect(screen.getByTestId("component-b")).toHaveTextContent("B idle");

      // Trigger Component A
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "1" });
      });

      expect(screen.getByTestId("component-a")).toHaveTextContent(
        "A triggered"
      );
      expect(screen.getByTestId("component-b")).toHaveTextContent("B idle");

      // Clean up and trigger Component B
      act(() => {
        fireEvent.keyUp(window, { key: "1" });
        fireEvent.keyUp(window, { key: "Control" });
      });

      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "2" });
      });

      expect(screen.getByTestId("component-a")).toHaveTextContent(
        "A triggered"
      );
      expect(screen.getByTestId("component-b")).toHaveTextContent(
        "B triggered"
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw error when hook is used outside provider", () => {
      const ComponentWithoutProvider = () => {
        useKeyPress(); // This should throw
        return <div>Test</div>;
      };

      // Suppress console error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow("useKeyPress must be used within a KeyPressProvider");

      console.error = originalError;
    });
  });

  describe("Best Practices", () => {
    it("should clean up properly on unmount", () => {
      const { unmount } = render(
        <KeyPressProvider>
          <ExampleComponent />
        </KeyPressProvider>
      );

      // Press a key
      act(() => {
        fireEvent.keyDown(window, { key: "a" });
      });

      // Unmount should not cause any errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it("should handle rapid key sequences gracefully", () => {
      const onSave = vi.fn();

      render(
        <KeyPressProvider>
          <ExampleComponent onSave={onSave} />
        </KeyPressProvider>
      );

      // Rapid key sequence
      act(() => {
        fireEvent.keyDown(window, { key: "Control" });
        fireEvent.keyDown(window, { key: "s" });
        fireEvent.keyUp(window, { key: "s" });
        fireEvent.keyDown(window, { key: "s" });
        fireEvent.keyUp(window, { key: "s" });
        fireEvent.keyUp(window, { key: "Control" });
      });

      // Should have triggered save multiple times
      expect(onSave).toHaveBeenCalledTimes(2);
    });
  });
});
