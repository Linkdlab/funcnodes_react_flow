import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import {
  CustomDialog,
  type DialogProps,
  type DialogButtonConfig,
} from "./CustomDialog";

// Mock the FuncNodes context
const mockFuncNodesContext = {
  local_state: vi.fn((selector) =>
    selector({ funcnodescontainerRef: document.body })
  ),
};

// Mock the providers
vi.mock("@/providers", () => ({
  useFuncNodesContext: () => mockFuncNodesContext,
}));

// Mock the CloseIcon
vi.mock("@/icons", () => ({
  CloseIcon: () => <span data-testid="close-icon">×</span>,
}));

// Mock Radix UI Dialog components for testing
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, open, modal }: any) => (
    <div data-testid="dialog-root" data-open={open} data-modal={modal}>
      {children}
    </div>
  ),
  Trigger: ({ children, asChild }: any) =>
    asChild ? (
      children
    ) : (
      <button data-testid="dialog-trigger">{children}</button>
    ),
  Portal: ({ children }: any) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: ({ className }: any) => (
    <div data-testid="dialog-overlay" className={className} />
  ),
  Content: ({ children, asChild, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return (
      <div data-testid="dialog-content" {...props}>
        {children}
      </div>
    );
  },
  Title: ({ children, className, id }: any) => (
    <h1 data-testid="dialog-title" className={className} id={id}>
      {children}
    </h1>
  ),
  Description: ({ children, className, id }: any) => (
    <div data-testid="dialog-description" className={className} id={id}>
      {children}
    </div>
  ),
  Close: ({ children, asChild }: any) =>
    asChild ? children : <button data-testid="dialog-close">{children}</button>,
}));

// Mock console.error for error handling tests
const originalConsoleError = console.error;

describe("CustomDialog", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("basic rendering", () => {
    it("should render dialog with title and description", () => {
      render(
        <CustomDialog
          title="Test Dialog"
          description="This is a test dialog"
          open={true}
        >
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
      expect(screen.getByText("This is a test dialog")).toBeInTheDocument();
      expect(screen.getByText("Dialog content")).toBeInTheDocument();
    });

    it("should render dialog without title and description", () => {
      render(
        <CustomDialog open={true}>
          <p>Just content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByText("Just content")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(
        screen.queryByTestId("dialog-description")
      ).not.toBeInTheDocument();
    });

    it("should render a visually hidden title when no title is provided", () => {
      render(
        <CustomDialog open={true}>
          <p>Content only</p>
        </CustomDialog>
      );

      const title = screen.getByTestId("dialog-title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("dialog-title--visually-hidden");
    });

    it("should not set aria-describedby when no description is provided", () => {
      render(
        <CustomDialog open={true}>
          <p>Content only</p>
        </CustomDialog>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-describedby");
    });

    it("should render with custom className", () => {
      render(
        <CustomDialog open={true} dialogClassName="custom-dialog">
          <p>Custom styled dialog</p>
        </CustomDialog>
      );

      // Look for the dialog content div with the custom className
      const dialogContent = screen
        .getByText("Custom styled dialog")
        .closest(".dialog-content");
      expect(dialogContent).toHaveClass(
        "dialog-content",
        "funcnodescontainer",
        "custom-dialog"
      );
    });

    it("should render with default className when none provided", () => {
      render(
        <CustomDialog open={true}>
          <p>Default styled dialog</p>
        </CustomDialog>
      );

      const dialogContent = screen
        .getByText("Default styled dialog")
        .closest(".dialog-content");
      expect(dialogContent).toHaveClass(
        "dialog-content",
        "funcnodescontainer",
        "default-dialog-content"
      );
    });

    it("should render React node description", () => {
      render(
        <CustomDialog
          title="Test Dialog"
          description={
            <div data-testid="custom-description">Custom description</div>
          }
          open={true}
        >
          <p>Content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("custom-description")).toBeInTheDocument();
    });

    it("should handle open/closed states", () => {
      const { rerender } = render(
        <CustomDialog open={false}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toHaveAttribute(
        "data-open",
        "false"
      );

      rerender(
        <CustomDialog open={true}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toHaveAttribute(
        "data-open",
        "true"
      );
    });

    it("should handle modal state", () => {
      const { rerender } = render(
        <CustomDialog open={true} modal={true}>
          <p>Modal dialog</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toHaveAttribute(
        "data-modal",
        "true"
      );

      rerender(
        <CustomDialog open={true} modal={false}>
          <p>Non-modal dialog</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toHaveAttribute(
        "data-modal",
        "false"
      );
    });
  });

  describe("button functionality", () => {
    it("should render action buttons", () => {
      const buttons: DialogButtonConfig[] = [
        { text: "Cancel", onClick: vi.fn() },
        { text: "Confirm", onClick: vi.fn() },
      ];

      render(
        <CustomDialog title="Confirm Dialog" buttons={buttons} open={true}>
          <p>Are you sure?</p>
        </CustomDialog>
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("should call onClick handlers when buttons are clicked", async () => {
      const user = userEvent.setup();
      const cancelHandler = vi.fn();
      const confirmHandler = vi.fn();

      const buttons: DialogButtonConfig[] = [
        { text: "Cancel", onClick: cancelHandler },
        { text: "Confirm", onClick: confirmHandler },
      ];

      render(
        <CustomDialog title="Confirm Dialog" buttons={buttons} open={true}>
          <p>Are you sure?</p>
        </CustomDialog>
      );

      await user.click(screen.getByText("Cancel"));
      expect(cancelHandler).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText("Confirm"));
      expect(confirmHandler).toHaveBeenCalledTimes(1);
    });

    it("should handle buttons with custom properties", () => {
      const buttons: DialogButtonConfig[] = [
        {
          text: "Disabled",
          onClick: vi.fn(),
          disabled: true,
          className: "custom-button-class",
          ariaLabel: "Custom disabled button",
        },
        { text: "Enabled", onClick: vi.fn(), close: false },
      ];

      render(
        <CustomDialog title="Custom Buttons" buttons={buttons} open={true}>
          <p>Custom button test</p>
        </CustomDialog>
      );

      const disabledButton = screen.getByText("Disabled");
      expect(disabledButton).toBeDisabled();
      expect(disabledButton).toHaveClass("custom-button-class");
      expect(disabledButton).toHaveAttribute(
        "aria-label",
        "Custom disabled button"
      );

      const enabledButton = screen.getByText("Enabled");
      expect(enabledButton).not.toBeDisabled();
    });

    it("should prevent default on button clicks", async () => {
      const user = userEvent.setup();
      const mockHandler = vi.fn();

      const buttons: DialogButtonConfig[] = [
        { text: "Test", onClick: mockHandler },
      ];

      render(
        <CustomDialog title="Test Dialog" buttons={buttons} open={true}>
          <p>Test content</p>
        </CustomDialog>
      );

      await user.click(screen.getByText("Test"));

      // Check that the handler was called
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should handle empty buttons array", () => {
      render(
        <CustomDialog open={true} buttons={[]}>
          <p>No buttons</p>
        </CustomDialog>
      );

      expect(screen.getByText("No buttons")).toBeInTheDocument();
      expect(
        screen.queryByRole("group", { name: "Dialog actions" })
      ).not.toBeInTheDocument();
    });

    it("should handle buttons with empty text", () => {
      const buttons: DialogButtonConfig[] = [{ text: "", onClick: vi.fn() }];

      render(
        <CustomDialog open={true} buttons={buttons}>
          <p>Empty button text</p>
        </CustomDialog>
      );

      const buttonElement = screen.getByRole("button", { name: "" });
      expect(buttonElement).toBeInTheDocument();
    });
  });

  describe("close button functionality", () => {
    it("should render close button by default", () => {
      render(
        <CustomDialog open={true}>
          <p>Dialog with close button</p>
        </CustomDialog>
      );

      expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    });

    it("should not render close button when closebutton is false", () => {
      render(
        <CustomDialog open={true} closebutton={false}>
          <p>Dialog without close button</p>
        </CustomDialog>
      );

      expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
    });
  });

  describe("controlled state", () => {
    it("should call onOpenChange when provided", () => {
      const onOpenChange = vi.fn();

      render(
        <CustomDialog open={true} onOpenChange={onOpenChange}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      // The onOpenChange should be passed to the Dialog.Root
      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
    });

    it("should handle errors in open change handler gracefully", () => {
      const errorHandler = vi.fn(() => {
        throw new Error("Handler error");
      });

      render(
        <CustomDialog open={true} onOpenChange={errorHandler}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <CustomDialog
          title="Accessible Dialog"
          description="This is accessible"
          ariaLabel="Custom aria label"
          ariaDescription="Custom aria description"
          open={true}
        >
          <p>Content</p>
        </CustomDialog>
      );

      const dialogContent = screen
        .getByText("Content")
        .closest(".dialog-content");
      expect(dialogContent).toHaveAttribute("aria-label", "Custom aria label");
      expect(dialogContent).toHaveAttribute(
        "aria-description",
        "Custom aria description"
      );
    });

    it("should use title as aria-label when no custom ariaLabel provided", () => {
      render(
        <CustomDialog title="Dialog Title" open={true}>
          <p>Content</p>
        </CustomDialog>
      );

      const dialogContent = screen
        .getByText("Content")
        .closest(".dialog-content");
      expect(dialogContent).toHaveAttribute("aria-label", "Dialog Title");
    });

    it("should use description as aria-description when it's a string", () => {
      render(
        <CustomDialog
          title="Dialog Title"
          description="String description"
          open={true}
        >
          <p>Content</p>
        </CustomDialog>
      );

      const dialogContent = screen
        .getByText("Content")
        .closest(".dialog-content");
      expect(dialogContent).toHaveAttribute(
        "aria-description",
        "String description"
      );
    });

    it("should have proper role attributes", () => {
      const buttons: DialogButtonConfig[] = [
        { text: "Action", onClick: vi.fn() },
      ];

      render(
        <CustomDialog title="Dialog with roles" buttons={buttons} open={true}>
          <p>Content</p>
        </CustomDialog>
      );

      const dialogContent = screen
        .getByText("Content")
        .closest(".dialog-content");
      expect(dialogContent).toHaveAttribute("role", "dialog");

      const mainContent = screen.getByRole("main");
      expect(mainContent).toBeInTheDocument();

      const buttonGroup = screen.getByRole("group", { name: "Dialog actions" });
      expect(buttonGroup).toBeInTheDocument();
    });

    it("should have proper heading structure", () => {
      render(
        <CustomDialog title="Dialog Title" open={true}>
          <p>Content</p>
        </CustomDialog>
      );

      const title = screen.getByTestId("dialog-title");
      expect(title.tagName).toBe("H1");
      expect(title).toHaveClass("dialog-title");
    });

    it("should have proper button attributes", () => {
      const buttons: DialogButtonConfig[] = [
        { text: "Action", onClick: vi.fn(), ariaLabel: "Custom action label" },
      ];

      render(
        <CustomDialog title="Dialog with buttons" buttons={buttons} open={true}>
          <p>Content</p>
        </CustomDialog>
      );

      const actionButton = screen.getByText("Action");
      expect(actionButton).toHaveAttribute("type", "button");
      expect(actionButton).toHaveAttribute("aria-label", "Custom action label");

      const closeButton = screen.getByLabelText("Close dialog");
      expect(closeButton).toHaveAttribute("type", "button");
    });
  });

  describe("trigger functionality", () => {
    it("should render trigger element", () => {
      render(
        <CustomDialog trigger={<button>Open Dialog</button>} open={false}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
    });

    it("should not render trigger when not provided", () => {
      render(
        <CustomDialog open={false}>
          <p>Dialog content</p>
        </CustomDialog>
      );

      expect(screen.queryByTestId("dialog-trigger")).not.toBeInTheDocument();
    });
  });

  describe("portal rendering", () => {
    it("should use the portal container from context", () => {
      render(
        <CustomDialog open={true}>
          <p>Portal dialog</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-portal")).toBeInTheDocument();
      expect(mockFuncNodesContext.local_state).toHaveBeenCalled();
    });
  });

  describe("performance optimizations", () => {
    it("should memoize className concatenation", () => {
      const { rerender } = render(
        <CustomDialog open={true} dialogClassName="test-class">
          <p>Test content</p>
        </CustomDialog>
      );

      const firstDialogContent = screen
        .getByText("Test content")
        .closest("div");
      const firstClassName = firstDialogContent?.className;

      // Re-render with same props
      rerender(
        <CustomDialog open={true} dialogClassName="test-class">
          <p>Test content</p>
        </CustomDialog>
      );

      const secondDialogContent = screen
        .getByText("Test content")
        .closest("div");
      expect(secondDialogContent?.className).toBe(firstClassName);
    });

    it("should handle button array changes efficiently", () => {
      const initialButtons: DialogButtonConfig[] = [
        { text: "Button 1", onClick: vi.fn() },
      ];

      const { rerender } = render(
        <CustomDialog open={true} buttons={initialButtons}>
          <p>Button test</p>
        </CustomDialog>
      );

      expect(screen.getByText("Button 1")).toBeInTheDocument();

      const newButtons: DialogButtonConfig[] = [
        { text: "Button 1", onClick: vi.fn() },
        { text: "Button 2", onClick: vi.fn() },
      ];

      rerender(
        <CustomDialog open={true} buttons={newButtons}>
          <p>Button test</p>
        </CustomDialog>
      );

      expect(screen.getByText("Button 1")).toBeInTheDocument();
      expect(screen.getByText("Button 2")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle very long content", () => {
      const longContent = "Very long content. ".repeat(100);

      render(
        <CustomDialog
          open={true}
          title="Long Content Dialog"
          description={longContent}
        >
          <p>{longContent}</p>
        </CustomDialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByText("Long Content Dialog")).toBeInTheDocument();
    });

    it("should handle special characters in content", () => {
      const specialContent =
        'Content with <script>alert("xss")</script> & symbols ñáéíóú';

      render(
        <CustomDialog
          open={true}
          title="Special Characters"
          description={specialContent}
        >
          <p>{specialContent}</p>
        </CustomDialog>
      );

      expect(screen.getByText("Special Characters")).toBeInTheDocument();
    });
  });

  describe("component display name", () => {
    it("should have correct display name", () => {
      expect(CustomDialog.displayName).toBe("CustomDialog");
    });
  });

  describe("type safety", () => {
    it("should accept all valid props", () => {
      const buttons: DialogButtonConfig[] = [
        { text: "Test", onClick: vi.fn() },
      ];

      const validProps: DialogProps = {
        trigger: <button>Trigger</button>,
        title: "Test Title",
        description: "Test Description",
        children: <p>Test Content</p>,
        closebutton: true,
        modal: true,
        dialogClassName: "test-class",
        onOpenChange: vi.fn(),
        buttons,
        open: true,
        setOpen: vi.fn(),
        ariaLabel: "Test Aria Label",
        ariaDescription: "Test Aria Description",
      };

      render(<CustomDialog {...validProps} />);

      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
  });
});
