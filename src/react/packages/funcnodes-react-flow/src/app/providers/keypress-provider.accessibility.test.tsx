import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  KeyPressProvider,
  useKeyboardShortcuts,
} from "./keypress-provider";

import {
  simulateKeyCombo,
} from "./keypress-provider.test-utils";

// Accessible form component
const AccessibleForm: React.FC<{
  onSubmit: (data: Record<string, string>) => void;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({ name: "", email: "" });

  useKeyboardShortcuts({
    "Control+Enter": () => {
      onSubmit(formData);
    },
    Escape: () => {
      setFormData({ name: "", email: "" });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      data-testid="accessible-form"
      role="form"
      aria-label="User registration form"
    >
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          data-testid="name-input"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          data-testid="email-input"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          aria-required="true"
        />
      </div>
      <button type="submit" data-testid="submit-button">
        Submit (Ctrl+Enter)
      </button>
      <div role="status" aria-live="polite" data-testid="form-status">
        Use Ctrl+Enter to submit quickly, or Escape to clear
      </div>
    </form>
  );
};

// Screen reader friendly list navigation
const AccessibleList: React.FC<{
  items: string[];
  onSelect: (item: string, index: number) => void;
}> = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [announceText, setAnnounceText] = React.useState("");

  useKeyboardShortcuts({
    ArrowDown: () => {
      const newIndex = Math.min(selectedIndex + 1, items.length - 1);
      setSelectedIndex(newIndex);
      setAnnounceText(
        `Selected ${items[newIndex]}, item ${newIndex + 1} of ${items.length}`
      );
    },
    ArrowUp: () => {
      const newIndex = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(newIndex);
      setAnnounceText(
        `Selected ${items[newIndex]}, item ${newIndex + 1} of ${items.length}`
      );
    },
    Home: () => {
      setSelectedIndex(0);
      setAnnounceText(`Selected ${items[0]}, first item`);
    },
    End: () => {
      const lastIndex = items.length - 1;
      setSelectedIndex(lastIndex);
      setAnnounceText(`Selected ${items[lastIndex]}, last item`);
    },
    Enter: () => {
      onSelect(items[selectedIndex], selectedIndex);
      setAnnounceText(`Activated ${items[selectedIndex]}`);
    },
    " ": () => {
      onSelect(items[selectedIndex], selectedIndex);
      setAnnounceText(`Activated ${items[selectedIndex]}`);
    },
  });

  return (
    <div>
      <ul
        role="listbox"
        aria-label="Selectable items"
        data-testid="accessible-list"
      >
        {items.map((item, index) => (
          <li
            key={index}
            role="option"
            aria-selected={index === selectedIndex}
            data-testid={`list-item-${index}`}
            style={{
              backgroundColor:
                index === selectedIndex ? "#007acc" : "transparent",
              color: index === selectedIndex ? "white" : "black",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        data-testid="announce-text"
        style={{ position: "absolute", left: "-9999px" }}
      >
        {announceText}
      </div>
    </div>
  );
};

// Modal with focus management
const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  useKeyboardShortcuts({
    Escape: onClose,
  });

  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="accessible-modal"
      ref={modalRef}
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
        }}
      >
        <h2 id="modal-title" data-testid="modal-title">
          {title}
        </h2>
        {children}
        <button onClick={onClose} data-testid="modal-close">
          Close (Escape)
        </button>
      </div>
    </div>
  );
};

// Command palette component
const CommandPalette: React.FC<{
  commands: Array<{ name: string; action: () => void; shortcut?: string }>;
  onClose: () => void;
}> = ({ commands, onClose }) => {
  const [filter, setFilter] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(filter.toLowerCase())
  );

  useKeyboardShortcuts({
    Escape: onClose,
    ArrowDown: () => {
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredCommands.length - 1)
      );
    },
    ArrowUp: () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    Enter: () => {
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    },
  });

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  return (
    <div
      data-testid="command-palette"
      role="combobox"
      aria-expanded="true"
      aria-haspopup="listbox"
      style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
      }}
    >
      <input
        type="text"
        placeholder="Type a command..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        data-testid="command-input"
        aria-label="Command search"
        autoFocus
      />
      <ul
        role="listbox"
        aria-label="Available commands"
        data-testid="command-list"
        style={{ marginTop: "8px", listStyle: "none", padding: 0 }}
      >
        {filteredCommands.map((command, index) => (
          <li
            key={command.name}
            role="option"
            aria-selected={index === selectedIndex}
            data-testid={`command-${index}`}
            style={{
              padding: "8px",
              backgroundColor:
                index === selectedIndex ? "#007acc" : "transparent",
              color: index === selectedIndex ? "white" : "black",
              cursor: "pointer",
            }}
            onClick={() => {
              command.action();
              onClose();
            }}
          >
            <span>{command.name}</span>
            {command.shortcut && (
              <span style={{ float: "right", opacity: 0.7 }}>
                {command.shortcut}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("KeyPressProvider Accessibility Tests", () => {
  describe("Form Accessibility", () => {
    it("should support keyboard shortcuts without breaking form navigation", () => {
      const onSubmit = vi.fn();

      render(
        <KeyPressProvider ignoredKeys={["Tab"]}>
          <AccessibleForm onSubmit={onSubmit} />
        </KeyPressProvider>
      );

      const nameInput = screen.getByTestId("name-input");
      const emailInput = screen.getByTestId("email-input");

      // Test normal form navigation
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      // Tab navigation should work (Tab is ignored)
      fireEvent.keyDown(nameInput, { key: "Tab" });
      emailInput.focus(); // Simulate tab behavior
      expect(document.activeElement).toBe(emailInput);

      // Test form shortcuts
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      simulateKeyCombo(["Control"], "Enter");
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });

      // Test form reset
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });
      expect(nameInput).toHaveValue("");
      expect(emailInput).toHaveValue("");
    });

    it("should provide proper aria announcements", () => {
      const onSubmit = vi.fn();

      render(
        <KeyPressProvider>
          <AccessibleForm onSubmit={onSubmit} />
        </KeyPressProvider>
      );

      const statusElement = screen.getByTestId("form-status");
      expect(statusElement).toHaveAttribute("role", "status");
      expect(statusElement).toHaveAttribute("aria-live", "polite");
      expect(statusElement).toHaveTextContent(
        "Use Ctrl+Enter to submit quickly, or Escape to clear"
      );
    });
  });

  describe("List Navigation Accessibility", () => {
    it("should provide proper screen reader announcements for list navigation", async () => {
      const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];
      const onSelect = vi.fn();

      render(
        <KeyPressProvider>
          <AccessibleList items={items} onSelect={onSelect} />
        </KeyPressProvider>
      );

      const list = screen.getByTestId("accessible-list");
      expect(list).toHaveAttribute("role", "listbox");
      expect(list).toHaveAttribute("aria-label", "Selectable items");

      // Test arrow navigation
      act(() => {
        fireEvent.keyDown(window, { key: "ArrowDown" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("announce-text")).toHaveTextContent(
          "Selected Banana, item 2 of 5"
        );
      });

      act(() => {
        fireEvent.keyDown(window, { key: "ArrowUp" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("announce-text")).toHaveTextContent(
          "Selected Apple, item 1 of 5"
        );
      });

      // Test Home/End navigation
      act(() => {
        fireEvent.keyDown(window, { key: "End" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("announce-text")).toHaveTextContent(
          "Selected Elderberry, last item"
        );
      });

      act(() => {
        fireEvent.keyDown(window, { key: "Home" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("announce-text")).toHaveTextContent(
          "Selected Apple, first item"
        );
      });

      // Test selection
      act(() => {
        fireEvent.keyDown(window, { key: "Enter" });
      });

      expect(onSelect).toHaveBeenCalledWith("Apple", 0);

      await waitFor(() => {
        expect(screen.getByTestId("announce-text")).toHaveTextContent(
          "Activated Apple"
        );
      });
    });

    it("should handle space bar selection", () => {
      const items = ["Item 1", "Item 2"];
      const onSelect = vi.fn();

      render(
        <KeyPressProvider>
          <AccessibleList items={items} onSelect={onSelect} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: " " });
      });

      expect(onSelect).toHaveBeenCalledWith("Item 1", 0);
    });
  });

  describe("Modal Accessibility", () => {
    it("should manage focus correctly and support escape key", () => {
      const onClose = vi.fn();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <KeyPressProvider>
            <button data-testid="open-modal" onClick={() => setIsOpen(true)}>
              Open Modal
            </button>
            <AccessibleModal
              isOpen={isOpen}
              onClose={() => {
                setIsOpen(false);
                onClose();
              }}
              title="Test Modal"
            >
              <p>Modal content here</p>
            </AccessibleModal>
          </KeyPressProvider>
        );
      };

      render(<TestComponent />);

      const openButton = screen.getByTestId("open-modal");

      // Open modal
      fireEvent.click(openButton);

      const modal = screen.getByTestId("accessible-modal");
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute("role", "dialog");
      expect(modal).toHaveAttribute("aria-modal", "true");
      expect(modal).toHaveAttribute("aria-labelledby", "modal-title");

      // Test escape key
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Command Palette Accessibility", () => {
    it("should provide accessible command search and navigation", async () => {
      const commands = [
        { name: "New File", action: vi.fn(), shortcut: "Ctrl+N" },
        { name: "Open File", action: vi.fn(), shortcut: "Ctrl+O" },
        { name: "Save File", action: vi.fn(), shortcut: "Ctrl+S" },
        { name: "Find in Files", action: vi.fn(), shortcut: "Ctrl+Shift+F" },
      ];
      const onClose = vi.fn();

      render(
        <KeyPressProvider>
          <CommandPalette commands={commands} onClose={onClose} />
        </KeyPressProvider>
      );

      const palette = screen.getByTestId("command-palette");
      expect(palette).toHaveAttribute("role", "combobox");
      expect(palette).toHaveAttribute("aria-expanded", "true");
      expect(palette).toHaveAttribute("aria-haspopup", "listbox");

      const input = screen.getByTestId("command-input");
      expect(input).toHaveAttribute("aria-label", "Command search");

      const commandList = screen.getByTestId("command-list");
      expect(commandList).toHaveAttribute("role", "listbox");
      expect(commandList).toHaveAttribute("aria-label", "Available commands");

      // Test filtering
      fireEvent.change(input, { target: { value: "file" } });

      await waitFor(() => {
        expect(screen.getByTestId("command-0")).toHaveTextContent("New File");
        expect(screen.getByTestId("command-1")).toHaveTextContent("Open File");
        expect(screen.getByTestId("command-2")).toHaveTextContent("Save File");
        expect(screen.getByTestId("command-3")).toHaveTextContent(
          "Find in Files"
        );
      });

      // Test navigation
      act(() => {
        fireEvent.keyDown(window, { key: "ArrowDown" });
      });

      expect(screen.getByTestId("command-1")).toHaveAttribute(
        "aria-selected",
        "true"
      );

      // Test selection
      act(() => {
        fireEvent.keyDown(window, { key: "Enter" });
      });

      expect(commands[1].action).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it("should close on escape key", () => {
      const commands = [{ name: "Test Command", action: vi.fn() }];
      const onClose = vi.fn();

      render(
        <KeyPressProvider>
          <CommandPalette commands={commands} onClose={onClose} />
        </KeyPressProvider>
      );

      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("High Contrast and Visual Accessibility", () => {
    it("should work with high contrast mode", () => {
      const items = ["Item 1", "Item 2"];
      const onSelect = vi.fn();

      render(
        <KeyPressProvider>
          <AccessibleList items={items} onSelect={onSelect} />
        </KeyPressProvider>
      );

      const selectedItem = screen.getByTestId("list-item-0");
      expect(selectedItem).toHaveAttribute("aria-selected", "true");

      // Test that selection still works visually
      act(() => {
        fireEvent.keyDown(window, { key: "ArrowDown" });
      });

      expect(screen.getByTestId("list-item-1")).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(screen.getByTestId("list-item-0")).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });
  });

  describe("Keyboard-Only Users", () => {
    it("should provide complete functionality via keyboard", () => {
      const onAction = vi.fn();

      const KeyboardOnlyApp = () => {
        const [modalOpen, setModalOpen] = React.useState(false);

        useKeyboardShortcuts({
          "Control+m": () => setModalOpen(true),
          "Control+1": () => onAction("action1"),
          "Control+2": () => onAction("action2"),
        });

        return (
          <div>
            <div data-testid="keyboard-app">
              <p>
                Use Ctrl+M to open modal, Ctrl+1 for action 1, Ctrl+2 for action
                2
              </p>
            </div>
            <AccessibleModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Keyboard Accessible Modal"
            >
              <p>This modal can be opened and closed via keyboard</p>
            </AccessibleModal>
          </div>
        );
      };

      render(
        <KeyPressProvider>
          <KeyboardOnlyApp />
        </KeyPressProvider>
      );

      // Test keyboard shortcuts
      simulateKeyCombo(["Control"], "1");
      expect(onAction).toHaveBeenCalledWith("action1");

      simulateKeyCombo(["Control"], "2");
      expect(onAction).toHaveBeenCalledWith("action2");

      // Test modal opening via keyboard
      simulateKeyCombo(["Control"], "m");
      expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();

      // Test modal closing via escape
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(screen.queryByTestId("accessible-modal")).not.toBeInTheDocument();
    });
  });

  describe("Integration with Assistive Technologies", () => {
    it("should not interfere with screen reader navigation keys", () => {
      const onAction = vi.fn();

      const ScreenReaderFriendlyComponent = () => {
        useKeyboardShortcuts({
          "Control+h": () => onAction("help"),
          "Control+l": () => onAction("landmarks"),
        });

        return (
          <div>
            <nav role="navigation" aria-label="Main navigation">
              <a href="#content" data-testid="skip-link">
                Skip to content
              </a>
            </nav>
            <main id="content" role="main">
              <h1>Main Content</h1>
              <p>This content is screen reader accessible</p>
            </main>
            <aside role="complementary" aria-label="Related information">
              <p>Sidebar content</p>
            </aside>
          </div>
        );
      };

      render(
        <KeyPressProvider
          ignoredKeys={["Tab", "ArrowUp", "ArrowDown", "Home", "End"]}
        >
          <ScreenReaderFriendlyComponent />
        </KeyPressProvider>
      );

      // Screen reader navigation keys should be ignored
      act(() => {
        fireEvent.keyDown(window, { key: "Tab" });
        fireEvent.keyDown(window, { key: "ArrowDown" });
        fireEvent.keyDown(window, { key: "Home" });
      });

      // But app shortcuts should still work
      simulateKeyCombo(["Control"], "h");
      expect(onAction).toHaveBeenCalledWith("help");

      simulateKeyCombo(["Control"], "l");
      expect(onAction).toHaveBeenCalledWith("landmarks");
    });

    it("should work with voice control software", () => {
      const onCommand = vi.fn();

      const VoiceControlComponent = () => {
        useKeyboardShortcuts({
          "Control+Shift+v": () => onCommand("voice-command"),
        });

        return (
          <div data-testid="voice-control-app">
            <button
              data-testid="clickable-button"
              onClick={() => onCommand("clicked")}
            >
              Click me or say "press button"
            </button>
          </div>
        );
      };

      render(
        <KeyPressProvider>
          <VoiceControlComponent />
        </KeyPressProvider>
      );

      // Test both mouse/voice interaction and keyboard
      fireEvent.click(screen.getByTestId("clickable-button"));
      expect(onCommand).toHaveBeenCalledWith("clicked");

      simulateKeyCombo(["Control", "Shift"], "v");
      expect(onCommand).toHaveBeenCalledWith("voice-command");
    });
  });
});
