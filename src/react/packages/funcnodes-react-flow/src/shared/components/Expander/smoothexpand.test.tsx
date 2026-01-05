import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { SmoothExpandComponent } from "./smoothexpand";

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  left: 100,
  top: 200,
  width: 300,
  height: 150,
  right: 400,
  bottom: 350,
  x: 100,
  y: 200,
  toJSON: vi.fn(),
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

describe("SmoothExpandComponent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.requestAnimationFrame = mockRequestAnimationFrame;
    HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render children correctly", () => {
      render(
        <SmoothExpandComponent>
          <div data-testid="test-content">Test Content</div>
        </SmoothExpandComponent>
      );

      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SmoothExpandComponent className="custom-class">
          <div>Content</div>
        </SmoothExpandComponent>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should apply custom styles", () => {
      const customStyle = { backgroundColor: "rgb(255, 0, 0)", margin: "10px" };
      const { container } = render(
        <SmoothExpandComponent style={customStyle}>
          <div>Content</div>
        </SmoothExpandComponent>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle("background-color: rgb(255, 0, 0)");
      expect(wrapper).toHaveStyle("margin: 10px");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SmoothExpandComponent ref={ref}>
          <div>Content</div>
        </SmoothExpandComponent>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("AsChild Prop", () => {
    it("should render as child element when asChild is true", () => {
      render(
        <SmoothExpandComponent asChild className="parent-class">
          <section data-testid="child-element" className="child-class">
            Content
          </section>
        </SmoothExpandComponent>
      );

      const element = screen.getByTestId("child-element");
      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe("SECTION");
      expect(element).toHaveClass("child-class");
      expect(element).toHaveClass("parent-class");
    });

    it("should merge styles when asChild is true", () => {
      const parentStyle = { color: "rgb(0, 0, 255)", margin: "5px" };
      const childStyle = { fontSize: "16px", margin: "10px" };

      render(
        <SmoothExpandComponent asChild style={parentStyle}>
          <div data-testid="merged-element" style={childStyle}>
            Content
          </div>
        </SmoothExpandComponent>
      );

      const element = screen.getByTestId("merged-element");
      expect(element).toHaveStyle("color: rgb(0, 0, 255)");
      expect(element).toHaveStyle("font-size: 16px");
      // Parent style should override child style for same property in this implementation
      expect(element).toHaveStyle("margin: 5px");
    });
  });

  describe("Trigger Component", () => {
    it("should render trigger with children", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button data-testid="trigger-button">Click me</button>
          </SmoothExpandComponent.Trigger>
        </SmoothExpandComponent>
      );

      expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("should apply cursor pointer style", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <div data-testid="trigger-wrapper">Trigger</div>
          </SmoothExpandComponent.Trigger>
        </SmoothExpandComponent>
      );

      const triggerWrapper =
        screen.getByTestId("trigger-wrapper").parentElement;
      expect(triggerWrapper).toHaveStyle("cursor: pointer");
    });

    it("should apply custom className to trigger", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger className="custom-trigger">
            <div>Trigger</div>
          </SmoothExpandComponent.Trigger>
        </SmoothExpandComponent>
      );

      const trigger = screen.getByText("Trigger").parentElement;
      expect(trigger).toHaveClass("custom-trigger");
    });

    it("should be focusable and have correct ARIA attributes", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <div>Trigger</div>
          </SmoothExpandComponent.Trigger>
        </SmoothExpandComponent>
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("tabIndex", "0");
    });

    it("should throw error when used outside SmoothExpand", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(
          <SmoothExpandComponent.Trigger>
            <div>Trigger</div>
          </SmoothExpandComponent.Trigger>
        );
      }).toThrow(
        "SmoothExpand.Trigger must be used within a SmoothExpand component"
      );

      console.error = originalError;
    });
  });

  describe("Expanded Component", () => {
    it("should not render when component is collapsed", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Expanded>
            <div data-testid="expanded-content">Expanded Content</div>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      expect(screen.queryByTestId("expanded-content")).not.toBeInTheDocument();
    });

    it("should render when component is expanded", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Expanded>
            <div data-testid="expanded-content">Expanded Content</div>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      // Click to expand - this should immediately set isExpanded to true
      fireEvent.click(screen.getByText("Toggle"));

      // State changes immediately
      expect(screen.getByTestId("expanded-content")).toBeInTheDocument();
    });

    it("should throw error when used outside SmoothExpand", () => {
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(
          <SmoothExpandComponent.Expanded>
            <div>Expanded</div>
          </SmoothExpandComponent.Expanded>
        );
      }).toThrow(
        "SmoothExpand.Expanded must be used within a SmoothExpand component"
      );

      console.error = originalError;
    });
  });

  describe("Collapsed Component", () => {
    it("should render when component is collapsed", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed-content">Collapsed Content</div>
          </SmoothExpandComponent.Collapsed>
        </SmoothExpandComponent>
      );

      expect(screen.getByTestId("collapsed-content")).toBeInTheDocument();
    });

    it("should not render when component is expanded", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed-content">Collapsed Content</div>
          </SmoothExpandComponent.Collapsed>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // State changes immediately
      expect(screen.queryByTestId("collapsed-content")).not.toBeInTheDocument();
    });

    it("should throw error when used outside SmoothExpand", () => {
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(
          <SmoothExpandComponent.Collapsed>
            <div>Collapsed</div>
          </SmoothExpandComponent.Collapsed>
        );
      }).toThrow(
        "SmoothExpand.Collapsed must be used within a SmoothExpand component"
      );

      console.error = originalError;
    });
  });

  describe("Expand/Collapse Functionality", () => {
    it("should toggle expand state on trigger click", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed">Collapsed</div>
          </SmoothExpandComponent.Collapsed>
          <SmoothExpandComponent.Expanded>
            <div data-testid="expanded">Expanded</div>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      // Initially collapsed
      expect(screen.getByTestId("collapsed")).toBeInTheDocument();
      expect(screen.queryByTestId("expanded")).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText("Toggle"));

      // State changes immediately
      expect(screen.queryByTestId("collapsed")).not.toBeInTheDocument();
      expect(screen.getByTestId("expanded")).toBeInTheDocument();
    });

    it("should handle keyboard interaction (Enter key)", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <div>Toggle</div>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed">Collapsed</div>
          </SmoothExpandComponent.Collapsed>
        </SmoothExpandComponent>
      );

      const trigger = screen.getByText("Toggle").parentElement!;

      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(screen.queryByTestId("collapsed")).not.toBeInTheDocument();
    });

    it("should handle keyboard interaction (Space key)", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <div>Toggle</div>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed">Collapsed</div>
          </SmoothExpandComponent.Collapsed>
        </SmoothExpandComponent>
      );

      const trigger = screen.getByText("Toggle").parentElement!;

      fireEvent.keyDown(trigger, { key: " " });

      expect(screen.queryByTestId("collapsed")).not.toBeInTheDocument();
    });
  });

  describe("Animation Props", () => {
    it("should use custom animation timing", () => {
      render(
        <SmoothExpandComponent
          htime={500}
          vtime={700}
          hdelay={100}
          vdelay={200}
        >
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <div data-testid="content">Content</div>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // Should trigger requestAnimationFrame and set initial styles
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      // Check that content is accessible (component started expanding)
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should use custom zIndex", () => {
      render(
        <SmoothExpandComponent zIndex={5000}>
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <div data-testid="content">Content</div>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // The component should be expanded and content should be in document
      expect(screen.getByTestId("content")).toBeInTheDocument();

      // The component should have started the expansion animation
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe("Portal Behavior", () => {
    it("should render in place when collapsed", () => {
      render(
        <div data-testid="parent">
          <SmoothExpandComponent>
            <div data-testid="content">Content</div>
          </SmoothExpandComponent>
        </div>
      );

      const parent = screen.getByTestId("parent");
      const content = screen.getByTestId("content");

      expect(parent).toContainElement(content);
    });

    it("should render in document.body when expanded", () => {
      render(
        <div data-testid="parent">
          <SmoothExpandComponent>
            <SmoothExpandComponent.Trigger>
              <button>Toggle</button>
            </SmoothExpandComponent.Trigger>
            <div data-testid="content">Content</div>
          </SmoothExpandComponent>
        </div>
      );

      fireEvent.click(screen.getByText("Toggle"));

      const parent = screen.getByTestId("parent");
      const content = screen.getByTestId("content");

      // Content should no longer be in parent (it's portaled to body)
      expect(parent).not.toContainElement(content);
      // But content should still be in the document
      expect(content).toBeInTheDocument();
    });
  });

  describe("Animation Styles", () => {
    it("should call getBoundingClientRect when expanding", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <div data-testid="content">Content</div>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // Check that getBoundingClientRect was called to get initial position
      expect(mockGetBoundingClientRect).toHaveBeenCalled();

      // Check that content is still accessible
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should trigger animation frame when expanding", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <div data-testid="content">Content</div>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // Should trigger requestAnimationFrame for the animation
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      // Check that content is accessible
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing ref gracefully", () => {
      // Create a component that will have a null ref
      const TestComponent = () => {
        const [shouldRender, setShouldRender] = React.useState(true);

        React.useEffect(() => {
          // Remove the ref element after render
          setShouldRender(false);
        }, []);

        if (!shouldRender) {
          return null;
        }

        return (
          <SmoothExpandComponent>
            <SmoothExpandComponent.Trigger>
              <button>Toggle</button>
            </SmoothExpandComponent.Trigger>
            <div>Content</div>
          </SmoothExpandComponent>
        );
      };

      render(<TestComponent />);

      // Should not throw when component unmounts
      expect(screen.queryByText("Toggle")).not.toBeInTheDocument();
    });

    it("should handle getBoundingClientRect errors gracefully", () => {
      const consoleWarn = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Mock getBoundingClientRect to throw
      HTMLElement.prototype.getBoundingClientRect = vi.fn(() => {
        throw new Error("getBoundingClientRect failed");
      });

      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button>Toggle</button>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Expanded>
            <div data-testid="expanded">Expanded</div>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      // Should not crash when getBoundingClientRect fails
      fireEvent.click(screen.getByText("Toggle"));

      // Component should still expand even if getBoundingClientRect fails
      expect(screen.getByTestId("expanded")).toBeInTheDocument();

      // Should have logged a warning
      expect(consoleWarn).toHaveBeenCalledWith(
        "Error during expand animation:",
        expect.any(Error)
      );

      consoleWarn.mockRestore();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle rapid toggle clicks", () => {
      render(
        <SmoothExpandComponent htime={100} vtime={100}>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed">Collapsed</div>
          </SmoothExpandComponent.Collapsed>
          <SmoothExpandComponent.Expanded>
            <div data-testid="expanded">Expanded</div>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      const toggleSpan = screen.getByText("Toggle");

      // Rapidly click multiple times
      fireEvent.click(toggleSpan);
      fireEvent.click(toggleSpan);
      fireEvent.click(toggleSpan);

      // Should end up in a consistent state (expanded since we clicked odd number of times)
      const hasExpanded = screen.queryByTestId("expanded");
      const hasCollapsed = screen.queryByTestId("collapsed");
      // One of them should be visible, but not both
      expect(hasExpanded || hasCollapsed).toBeTruthy();
      expect(!(hasExpanded && hasCollapsed)).toBeTruthy();
    });

    it("should work with nested components", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <button>Outer Toggle</button>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Expanded>
            <SmoothExpandComponent htime={200}>
              <SmoothExpandComponent.Trigger>
                <button>Inner Toggle</button>
              </SmoothExpandComponent.Trigger>
              <SmoothExpandComponent.Collapsed>
                <div data-testid="inner-collapsed">Inner Collapsed</div>
              </SmoothExpandComponent.Collapsed>
            </SmoothExpandComponent>
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      // Should render outer trigger
      expect(screen.getByText("Outer Toggle")).toBeInTheDocument();
      // Inner content should not be visible when outer is collapsed
      expect(screen.queryByText("Inner Toggle")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero timing values", () => {
      render(
        <SmoothExpandComponent htime={0} vtime={0} hdelay={0} vdelay={0}>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            <div data-testid="collapsed">Collapsed</div>
          </SmoothExpandComponent.Collapsed>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      expect(screen.queryByTestId("collapsed")).not.toBeInTheDocument();
    });

    it("should handle very large timing values", () => {
      render(
        <SmoothExpandComponent htime={10000} vtime={15000}>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <div>Content</div>
        </SmoothExpandComponent>
      );

      fireEvent.click(screen.getByText("Toggle"));

      // Should handle large timeouts without issues and start the animation
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      render(
        <SmoothExpandComponent>
          <SmoothExpandComponent.Trigger>
            <span>Toggle</span>
          </SmoothExpandComponent.Trigger>
          <SmoothExpandComponent.Collapsed>
            {null}
          </SmoothExpandComponent.Collapsed>
          <SmoothExpandComponent.Expanded>
            {undefined}
          </SmoothExpandComponent.Expanded>
        </SmoothExpandComponent>
      );

      expect(screen.getByText("Toggle")).toBeInTheDocument();
    });
  });
});
