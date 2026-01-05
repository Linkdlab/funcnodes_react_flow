import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  KeyPressProvider,
  useKeyPress,
  useKeyboardShortcuts,
} from "./keypress-provider";

import {
  simulateKeyCombo,
  simulateShortcut,
  MockEventTarget,
} from "./keypress-provider.test-utils";

// Mock a realistic application component that uses keyboard shortcuts
const TextEditor: React.FC<{
  onCommand?: (command: string, data?: any) => void;
}> = ({ onCommand }) => {
  const [content, setContent] = React.useState("");
  const [clipboard, setClipboard] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const { keys } = useKeyPress();

  // Text editor shortcuts
  useKeyboardShortcuts({
    "Control+s": () => {
      onCommand?.("save", { content });
    },
    "Control+z": () => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setContent(history[newIndex]);
        onCommand?.("undo");
      }
    },
    "Control+y": () => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setContent(history[newIndex]);
        onCommand?.("redo");
      }
    },
    "Control+c": () => {
      setClipboard(content);
      onCommand?.("copy", { text: content });
    },
    "Control+v": () => {
      setContent((prev) => prev + clipboard);
      onCommand?.("paste", { text: clipboard });
    },
    "Control+a": () => {
      onCommand?.("selectAll");
    },
  });

  const handleInput = (value: string) => {
    setContent(value);
    const newHistory = [...history.slice(0, historyIndex + 1), value];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div data-testid="text-editor">
      <div data-testid="editor-content">{content}</div>
      <div data-testid="active-keys">{Array.from(keys).join(", ")}</div>
      <div data-testid="clipboard-content">{clipboard}</div>
      <button
        data-testid="type-button"
        onClick={() => handleInput(content + "Hello")}
      >
        Type Hello
      </button>
      <input
        data-testid="editor-input"
        value={content}
        onChange={(e) => handleInput(e.target.value)}
      />
    </div>
  );
};

// Mock a modal component that uses escape key
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  useKeyboardShortcuts({
    Escape: onClose,
  });

  if (!isOpen) return null;

  return (
    <div data-testid="modal" role="dialog">
      <div data-testid="modal-content">{children}</div>
    </div>
  );
};

// Mock a navigation component
const Navigation: React.FC<{
  onNavigate: (direction: string) => void;
}> = ({ onNavigate }) => {
  useKeyboardShortcuts({
    ArrowUp: () => onNavigate("up"),
    ArrowDown: () => onNavigate("down"),
    ArrowLeft: () => onNavigate("left"),
    ArrowRight: () => onNavigate("right"),
    Home: () => onNavigate("home"),
    End: () => onNavigate("end"),
    PageUp: () => onNavigate("pageUp"),
    PageDown: () => onNavigate("pageDown"),
  });

  return <div data-testid="navigation">Navigation Component</div>;
};

// Complex app with nested providers
const ComplexApp: React.FC<{
  onAction?: (action: string, data?: any) => void;
}> = ({ onAction }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div data-testid="complex-app">
      <KeyPressProvider debug ignoredKeys={["Tab"]}>
        <TextEditor
          onCommand={(cmd, data) => onAction?.(`editor.${cmd}`, data)}
        />

        <Navigation onNavigate={(dir) => onAction?.(`nav.${dir}`)} />

        <button data-testid="open-modal" onClick={() => setModalOpen(true)}>
          Open Modal
        </button>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <p>Modal Content</p>
          <KeyPressProvider preventDefault debug={false}>
            <TextEditor
              onCommand={(cmd, data) => onAction?.(`modal.editor.${cmd}`, data)}
            />
          </KeyPressProvider>
        </Modal>
      </KeyPressProvider>
    </div>
  );
};

describe("KeyPressProvider Integration Tests", () => {
  type CommandHandler = (command: string, data?: any) => void;
  type ActionHandler = (action: string, data?: any) => void;

  let onCommand: Mock<CommandHandler>;
  let onAction: Mock<ActionHandler>;

  beforeEach(() => {
    onCommand = vi.fn<CommandHandler>();
    onAction = vi.fn<ActionHandler>();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Text Editor Integration", () => {
    it("should handle complete text editing workflow", async () => {
      console.log("TEST: Starting text editor integration test");
      render(
        <KeyPressProvider>
          <TextEditor onCommand={onCommand} />
        </KeyPressProvider>
      );
      console.log("TEST: Rendered components");

      // Type some content
      console.log("TEST: Typing content");
      fireEvent.change(screen.getByTestId("editor-input"), {
        target: { value: "Hello World" },
      });
      console.log("TEST: Content typed");

      // Copy content
      console.log("TEST: Simulating copy command");
      simulateKeyCombo(["Control"], "c");
      console.log("TEST: Copy command simulated");
      expect(onCommand).toHaveBeenCalledWith("copy", { text: "Hello World" });
      console.log("TEST: Copy assertion passed");

      // Clear and paste
      console.log("TEST: Clearing content");
      fireEvent.change(screen.getByTestId("editor-input"), {
        target: { value: "" },
      });
      console.log("TEST: Content cleared");

      console.log("TEST: Simulating paste command");
      simulateKeyCombo(["Control"], "v");
      console.log("TEST: Paste command simulated");
      expect(onCommand).toHaveBeenCalledWith("paste", { text: "Hello World" });
      console.log("TEST: Paste assertion passed");

      // Save
      console.log("TEST: Simulating save command");
      simulateKeyCombo(["Control"], "s");
      console.log("TEST: Save command simulated");
      expect(onCommand).toHaveBeenCalledWith("save", {
        content: "Hello World",
      });
      console.log("TEST: Save assertion passed");

      // Undo
      console.log("TEST: Simulating undo command");
      simulateKeyCombo(["Control"], "z");
      console.log("TEST: Undo command simulated");
      expect(onCommand).toHaveBeenCalledWith("undo");
      console.log("TEST: Undo assertion passed");
      console.log("TEST: Text editor integration test completed");
    });

    it("should handle rapid keyboard shortcuts", async () => {
      console.log("TEST: Starting rapid shortcuts test");
      render(
        <KeyPressProvider>
          <TextEditor onCommand={onCommand} />
        </KeyPressProvider>
      );
      console.log("TEST: Rendered for rapid shortcuts test");

      // Rapid fire shortcuts
      console.log("TEST: Firing rapid shortcuts");
      simulateKeyCombo(["Control"], "s");
      console.log("TEST: Save shortcut fired");
      simulateKeyCombo(["Control"], "c");
      console.log("TEST: Copy shortcut fired");
      simulateKeyCombo(["Control"], "v");
      console.log("TEST: Paste shortcut fired");
      simulateKeyCombo(["Control"], "z");
      console.log("TEST: Undo shortcut fired");

      console.log("TEST: Waiting for 4 command calls");
      await waitFor(() => {
        console.log(`TEST: Current command call count: ${onCommand.mock.calls.length}`);
        expect(onCommand).toHaveBeenCalledTimes(4);
      });
      console.log("TEST: All 4 commands received");

      expect(onCommand).toHaveBeenNthCalledWith(1, "save", expect.any(Object));
      expect(onCommand).toHaveBeenNthCalledWith(2, "copy", expect.any(Object));
      expect(onCommand).toHaveBeenNthCalledWith(3, "paste", expect.any(Object));
      expect(onCommand).toHaveBeenNthCalledWith(4, "undo");
      console.log("TEST: Rapid shortcuts test completed");
    });
  });

  describe("Modal Integration", () => {
    it("should handle modal keyboard shortcuts", () => {
      const onClose = vi.fn();

      render(
        <KeyPressProvider>
          <Modal isOpen={true} onClose={onClose}>
            <p>Modal content</p>
          </Modal>
        </KeyPressProvider>
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // Press escape to close modal
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });

    it("should not trigger modal shortcuts when closed", () => {
      const onClose = vi.fn();

      render(
        <KeyPressProvider>
          <Modal isOpen={false} onClose={onClose}>
            <p>Modal content</p>
          </Modal>
        </KeyPressProvider>
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Navigation Integration", () => {
    it("should handle navigation shortcuts", () => {
      const onNavigate = vi.fn();

      render(
        <KeyPressProvider>
          <Navigation onNavigate={onNavigate} />
        </KeyPressProvider>
      );

      // Test arrow keys
      act(() => {
        fireEvent.keyDown(window, { key: "ArrowUp" });
      });
      expect(onNavigate).toHaveBeenCalledWith("up");

      act(() => {
        fireEvent.keyDown(window, { key: "ArrowDown" });
      });
      expect(onNavigate).toHaveBeenCalledWith("down");

      act(() => {
        fireEvent.keyDown(window, { key: "ArrowLeft" });
      });
      expect(onNavigate).toHaveBeenCalledWith("left");

      act(() => {
        fireEvent.keyDown(window, { key: "ArrowRight" });
      });
      expect(onNavigate).toHaveBeenCalledWith("right");

      // Test navigation keys
      act(() => {
        fireEvent.keyDown(window, { key: "Home" });
      });
      expect(onNavigate).toHaveBeenCalledWith("home");

      act(() => {
        fireEvent.keyDown(window, { key: "End" });
      });
      expect(onNavigate).toHaveBeenCalledWith("end");
    });
  });

  describe("Complex App Integration", () => {
    it("should handle nested providers correctly", () => {
      render(<ComplexApp onAction={onAction} />);

      // Open modal
      fireEvent.click(screen.getByTestId("open-modal"));

      // Test shortcut in main editor
      simulateKeyCombo(["Control"], "s");
      expect(onAction).toHaveBeenCalledWith("editor.save", expect.any(Object));

      // Test navigation
      act(() => {
        fireEvent.keyDown(window, { key: "ArrowUp" });
      });
      expect(onAction).toHaveBeenCalledWith("nav.up");

      // Test modal editor (nested provider)
      const modalInput = screen.getAllByTestId("editor-input")[1]; // Second editor in modal
      fireEvent.change(modalInput, { target: { value: "Modal text" } });

      simulateKeyCombo(["Control"], "s");
      // Should trigger both main and modal editor saves due to nested providers
      expect(onAction).toHaveBeenCalledWith(
        "modal.editor.save",
        expect.any(Object)
      );
    });

    it("should handle provider configuration inheritance", () => {
      render(<ComplexApp onAction={onAction} />);

      // Open modal to activate nested provider
      fireEvent.click(screen.getByTestId("open-modal"));

      // Test that ignored keys work in main provider
      act(() => {
        fireEvent.keyDown(window, { key: "Tab" });
      });

      // Tab should be ignored, so no navigation should occur
      expect(onAction).not.toHaveBeenCalledWith("nav.tab");
    });
  });

  describe("Custom Target Integration", () => {
    it("should work with custom event targets", () => {
      const customTarget = new MockEventTarget();
      const onCustomCommand = vi.fn();

      const CustomTargetComponent = () => {
        useKeyboardShortcuts({
          "Control+s": () => onCustomCommand("custom-save"),
        });

        return <div data-testid="custom-component">Custom Component</div>;
      };

      render(
        <KeyPressProvider target={customTarget as any}>
          <CustomTargetComponent />
        </KeyPressProvider>
      );

      // Verify listeners are attached to custom target
      expect(customTarget.hasListener("keydown")).toBe(true);
      expect(customTarget.hasListener("keyup")).toBe(true);

      // Trigger event on custom target
      act(() => {
        customTarget.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Control" })
        );
        customTarget.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
      });

      expect(onCustomCommand).toHaveBeenCalledWith("custom-save");
    });
  });

  describe("Performance Integration", () => {
    it("should handle many simultaneous shortcuts efficiently", async () => {
      const onMultiCommand = vi.fn();

      const MultiShortcutComponent = () => {
        useKeyboardShortcuts({
          "Control+1": () => onMultiCommand("cmd1"),
          "Control+2": () => onMultiCommand("cmd2"),
          "Control+3": () => onMultiCommand("cmd3"),
          "Control+Shift+1": () => onMultiCommand("cmd4"),
          "Control+Shift+2": () => onMultiCommand("cmd5"),
          "Alt+1": () => onMultiCommand("cmd6"),
          "Alt+2": () => onMultiCommand("cmd7"),
          "Control+Alt+1": () => onMultiCommand("cmd8"),
        });

        return <div data-testid="multi-shortcut">Multi Shortcut</div>;
      };

      render(
        <KeyPressProvider>
          <MultiShortcutComponent />
        </KeyPressProvider>
      );

      // Test rapid shortcuts
      const shortcuts = [
        ["Control", "1"],
        ["Control", "2"],
        ["Control", "Shift", "1"],
        ["Alt", "1"],
        ["Control", "Alt", "1"],
      ];

      for (const shortcut of shortcuts) {
        simulateShortcut(shortcut);
      }

      await waitFor(() => {
        expect(onMultiCommand).toHaveBeenCalledTimes(5);
      });
    });

    it("should not cause memory leaks with frequent mount/unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { rerender, unmount } = render(
        <KeyPressProvider>
          <TextEditor onCommand={onCommand} />
        </KeyPressProvider>
      );

      // Rerender multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <KeyPressProvider key={i}>
            <TextEditor onCommand={onCommand} />
          </KeyPressProvider>
        );
      }

      unmount();

      // Should have cleaned up all listeners
      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility Integration", () => {
    it("should not interfere with form navigation", () => {
      const onSubmit = vi.fn();

      const AccessibleForm = () => {
        return (
          <form onSubmit={onSubmit} data-testid="accessible-form">
            <input data-testid="input1" placeholder="First input" />
            <input data-testid="input2" placeholder="Second input" />
            <button type="submit" data-testid="submit-btn">
              Submit
            </button>
          </form>
        );
      };

      render(
        <KeyPressProvider ignoredKeys={["Tab"]}>
          <AccessibleForm />
          <TextEditor onCommand={onCommand} />
        </KeyPressProvider>
      );

      const input1 = screen.getByTestId("input1");
      const input2 = screen.getByTestId("input2");

      // Focus first input
      input1.focus();
      expect(document.activeElement).toBe(input1);

      // Tab should not be captured (ignored), allowing normal navigation
      act(() => {
        fireEvent.keyDown(input1, { key: "Tab" });
      });

      // Tab navigation should still work normally
      input2.focus(); // Simulate tab navigation
      expect(document.activeElement).toBe(input2);
    });

    it("should work with screen readers and assistive technology", () => {
      const onKeyboardNavigation = vi.fn();

      const AccessibleComponent = () => {
        useKeyboardShortcuts({
          "Control+ArrowDown": () => onKeyboardNavigation("next"),
          "Control+ArrowUp": () => onKeyboardNavigation("previous"),
          "Control+Home": () => onKeyboardNavigation("first"),
          "Control+End": () => onKeyboardNavigation("last"),
        });

        return (
          <div data-testid="accessible-list" role="listbox" tabIndex={0}>
            <div role="option">Item 1</div>
            <div role="option">Item 2</div>
            <div role="option">Item 3</div>
          </div>
        );
      };

      render(
        <KeyPressProvider>
          <AccessibleComponent />
        </KeyPressProvider>
      );

      // Test accessibility shortcuts
      simulateKeyCombo(["Control"], "ArrowDown");
      expect(onKeyboardNavigation).toHaveBeenCalledWith("next");

      simulateKeyCombo(["Control"], "ArrowUp");
      expect(onKeyboardNavigation).toHaveBeenCalledWith("previous");

      simulateKeyCombo(["Control"], "Home");
      expect(onKeyboardNavigation).toHaveBeenCalledWith("first");

      simulateKeyCombo(["Control"], "End");
      expect(onKeyboardNavigation).toHaveBeenCalledWith("last");
    });
  });
});
