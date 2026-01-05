/**
 * @fileoverview Test suite for ExpandingContainer component
 * Tests for directional expansion, state management, callbacks, and performance optimizations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ExpandingContainer, ExpandingContainerProps } from "./index";

describe("ExpandingContainer", () => {
  // Default props for testing
  const defaultProps: ExpandingContainerProps = {
    direction: "right",
    children: <div data-testid="test-content">Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<ExpandingContainer {...defaultProps} />);

      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render children content", () => {
      const testContent = (
        <div data-testid="custom-content">Custom Test Content</div>
      );

      render(
        <ExpandingContainer direction="right">{testContent}</ExpandingContainer>
      );

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("Custom Test Content")).toBeInTheDocument();
    });

    it("should apply custom className to content", () => {
      render(
        <ExpandingContainer
          {...defaultProps}
          className="custom-content-class"
        />
      );

      const content = screen.getByTestId("test-content").parentElement;
      expect(content).toHaveClass("custom-content-class");
    });

    it("should apply custom containerClassName to main container", () => {
      render(
        <ExpandingContainer
          {...defaultProps}
          containerClassName="custom-container-class"
        />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveClass("custom-container-class");
    });
  });

  describe("Direction Support", () => {
    const directions: Array<ExpandingContainerProps["direction"]> = [
      "up",
      "down",
      "left",
      "right",
    ];

    directions.forEach((direction) => {
      it(`should render correctly for ${direction} direction`, () => {
        render(<ExpandingContainer {...defaultProps} direction={direction} />);

        const container = screen
          .getByTestId("test-content")
          .closest(".expanding_container");
        expect(container).toHaveClass(direction);
      });

      it(`should show correct expand icon for ${direction} direction`, () => {
        render(
          <ExpandingContainer
            {...defaultProps}
            direction={direction}
            expanded={false}
          />
        );

        const expectedIcon = {
          up: "▲",
          down: "▼",
          left: "◀",
          right: "▶",
        }[direction];

        expect(screen.getByText(expectedIcon)).toBeInTheDocument();
      });

      it(`should show correct collapse icon for ${direction} direction when expanded`, () => {
        render(
          <ExpandingContainer
            {...defaultProps}
            direction={direction}
            expanded={true}
          />
        );

        // Collapse icons point in the opposite direction for horizontal directions
        const expectedIcon = {
          up: "▲",
          down: "▼",
          left: "▶", // left collapse shows right arrow
          right: "◀", // right collapse shows left arrow
        }[direction];

        expect(screen.getByText(expectedIcon)).toBeInTheDocument();
      });
    });
  });

  describe("Custom Icons", () => {
    it("should use custom expand icons when provided", () => {
      const CustomUpIcon = () => <div data-testid="custom-up-expand">↑</div>;
      const CustomRightIcon = () => (
        <div data-testid="custom-right-expand">→</div>
      );

      const customExpandIcons = {
        up: CustomUpIcon,
        right: CustomRightIcon,
      };

      render(
        <ExpandingContainer
          direction="up"
          expanded={false}
          expandIcons={customExpandIcons}
        />
      );

      expect(screen.getByTestId("custom-up-expand")).toBeInTheDocument();
      expect(screen.getByText("↑")).toBeInTheDocument();
    });

    it("should use custom collapse icons when provided", () => {
      const CustomDownIcon = () => (
        <div data-testid="custom-down-collapse">↓</div>
      );

      const customCollapseIcons = {
        down: CustomDownIcon,
      };

      render(
        <ExpandingContainer
          direction="down"
          expanded={true}
          collapseIcons={customCollapseIcons}
        />
      );

      expect(screen.getByTestId("custom-down-collapse")).toBeInTheDocument();
      expect(screen.getByText("↓")).toBeInTheDocument();
    });

    it("should fall back to default icons when custom icons not provided for direction", () => {
      const CustomUpIcon = () => <div data-testid="custom-up">↑</div>;

      const customExpandIcons = {
        up: CustomUpIcon,
        // No left icon provided
      };

      render(
        <ExpandingContainer
          direction="left"
          expanded={false}
          expandIcons={customExpandIcons}
        />
      );

      // Should use default left icon since custom one not provided
      expect(screen.getByText("◀")).toBeInTheDocument();
      expect(screen.queryByTestId("custom-up")).not.toBeInTheDocument();
    });

    it("should use default icons when no custom icons provided", () => {
      render(<ExpandingContainer direction="right" expanded={false} />);

      expect(screen.getByText("▶")).toBeInTheDocument();
    });

    it("should switch between custom expand and collapse icons", () => {
      const CustomExpandIcon = () => <div data-testid="custom-expand">+</div>;
      const CustomCollapseIcon = () => (
        <div data-testid="custom-collapse">-</div>
      );

      const { rerender } = render(
        <ExpandingContainer
          direction="right"
          expanded={false}
          expandIcons={{ right: CustomExpandIcon }}
          collapseIcons={{ right: CustomCollapseIcon }}
        />
      );

      expect(screen.getByTestId("custom-expand")).toBeInTheDocument();
      expect(screen.queryByTestId("custom-collapse")).not.toBeInTheDocument();

      rerender(
        <ExpandingContainer
          direction="right"
          expanded={true}
          expandIcons={{ right: CustomExpandIcon }}
          collapseIcons={{ right: CustomCollapseIcon }}
        />
      );

      expect(screen.getByTestId("custom-collapse")).toBeInTheDocument();
      expect(screen.queryByTestId("custom-expand")).not.toBeInTheDocument();
    });
  });

  describe("Expansion State", () => {
    it("should render expanded by default", () => {
      render(<ExpandingContainer {...defaultProps} />);

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveClass("expanded");
    });

    it("should render collapsed when expanded=false", () => {
      render(<ExpandingContainer {...defaultProps} expanded={false} />);

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveClass("collapsed");
    });

    it("should toggle expansion on expander click", () => {
      render(<ExpandingContainer {...defaultProps} expanded={false} />);

      const expander = screen.getByRole("button");
      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");

      // Initially collapsed
      expect(container).toHaveClass("collapsed");

      // Click to expand
      fireEvent.click(expander);
      expect(container).toHaveClass("expanded");

      // Click to collapse
      fireEvent.click(expander);
      expect(container).toHaveClass("collapsed");
    });

    it("should respond to external expanded prop changes", async () => {
      const TestWrapper = () => {
        const [expanded, setExpanded] = React.useState(false);

        return (
          <div>
            <button
              data-testid="external-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              External Toggle
            </button>
            <ExpandingContainer {...defaultProps} expanded={expanded} />
          </div>
        );
      };

      render(<TestWrapper />);

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      const externalToggle = screen.getByTestId("external-toggle");

      // Initially collapsed
      expect(container).toHaveClass("collapsed");

      // External toggle should change state
      fireEvent.click(externalToggle);
      await waitFor(() => {
        expect(container).toHaveClass("expanded");
      });
    });
  });

  describe("Callbacks", () => {
    it("should call onExpandChange when toggling expansion", () => {
      const onExpandChange = vi.fn();

      render(
        <ExpandingContainer
          {...defaultProps}
          expanded={false}
          onExpandChange={onExpandChange}
        />
      );

      const expander = screen.getByRole("button");

      // Click to expand
      fireEvent.click(expander);
      expect(onExpandChange).toHaveBeenCalledWith(true);

      // Click to collapse
      fireEvent.click(expander);
      expect(onExpandChange).toHaveBeenCalledWith(false);

      expect(onExpandChange).toHaveBeenCalledTimes(2);
    });

    it("should not call onExpandChange when prop is not provided", () => {
      // This should not throw an error
      render(<ExpandingContainer {...defaultProps} expanded={false} />);

      const expander = screen.getByRole("button");
      fireEvent.click(expander);

      // Should not throw and component should still work
      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveClass("expanded");
    });
  });

  describe("Sizing and Styling", () => {
    it("should apply custom maxSize", () => {
      render(
        <ExpandingContainer {...defaultProps} maxSize="500px" expanded={true} />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveStyle({ width: "500px" });
    });

    it("should apply custom expanderSize", () => {
      render(
        <ExpandingContainer
          {...defaultProps}
          expanderSize="48px"
          expanded={false}
        />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveStyle({ width: "48px" });
    });

    it("should apply custom containerStyle", () => {
      const customStyle = {
        backgroundColor: "rgb(255, 0, 0)",
        margin: "10px",
        border: "2px solid rgb(0, 0, 255)",
      };

      render(
        <ExpandingContainer {...defaultProps} containerStyle={customStyle} />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveStyle("background-color: rgb(255, 0, 0)");
      expect(container).toHaveStyle("margin: 10px");
      // jsdom 27 doesn't provide computed values for the `border` shorthand,
      // but does expose the per-side shorthands.
      expect(container).toHaveStyle("border-top: 2px solid rgb(0, 0, 255)");
    });

    it("should apply custom content style", () => {
      const customStyle = {
        padding: "20px",
        border: "1px solid rgb(0, 0, 255)",
      };

      render(<ExpandingContainer {...defaultProps} style={customStyle} />);

      const content = screen.getByTestId("test-content").parentElement;
      expect(content).toHaveStyle({ padding: "20px" });
      expect(content).toHaveStyle("border-top: 1px solid rgb(0, 0, 255)");
    });

    it("should use correct dimensions for horizontal directions", () => {
      render(
        <ExpandingContainer direction="right" maxSize="400px" expanded={true}>
          <div data-testid="content">Content</div>
        </ExpandingContainer>
      );

      const container = screen
        .getByTestId("content")
        .closest(".expanding_container");
      expect(container).toHaveStyle({ width: "400px" });
    });

    it("should use correct dimensions for vertical directions", () => {
      render(
        <ExpandingContainer direction="down" maxSize="300px" expanded={true}>
          <div data-testid="content">Content</div>
        </ExpandingContainer>
      );

      const container = screen
        .getByTestId("content")
        .closest(".expanding_container");
      expect(container).toHaveStyle({ height: "300px" });
    });
  });

  describe("Component Layout", () => {
    it("should render expander before content for start directions (left/up)", () => {
      render(
        <ExpandingContainer direction="left" expanded={true}>
          Content
        </ExpandingContainer>
      );

      const container = screen
        .getByText("Content")
        .closest(".expanding_container");
      const children = Array.from(container?.children || []);

      expect(children[0]).toHaveClass("expanding_container_expander");
      expect(children[1]).toHaveClass("expanding_container_content");
    });

    it("should render content before expander for end directions (right/down)", () => {
      render(
        <ExpandingContainer direction="right" expanded={true}>
          Content
        </ExpandingContainer>
      );

      const container = screen
        .getByText("Content")
        .closest(".expanding_container");
      const children = Array.from(container?.children || []);

      expect(children[0]).toHaveClass("expanding_container_content");
      expect(children[1]).toHaveClass("expanding_container_expander");
    });
  });

  describe("Accessibility", () => {
    it("should have a clickable expander button", () => {
      render(<ExpandingContainer {...defaultProps} />);

      const expander = screen.getByRole("button");
      expect(expander).toBeInTheDocument();
      expect(expander).toHaveClass("expanding_container_expander");
    });

    it("should maintain focus management on expander", () => {
      render(<ExpandingContainer {...defaultProps} />);

      const expander = screen.getByRole("button");
      expander.focus();

      expect(document.activeElement).toBe(expander);
    });

    it("should handle keyboard interaction (Enter and Space)", () => {
      const onExpandChange = vi.fn();

      render(
        <ExpandingContainer
          {...defaultProps}
          expanded={false}
          onExpandChange={onExpandChange}
        />
      );

      const expander = screen.getByRole("button");

      // Test Enter key
      fireEvent.keyDown(expander, { key: "Enter" });
      expect(onExpandChange).toHaveBeenCalledWith(true);

      // Test Space key
      fireEvent.keyDown(expander, { key: " " });
      expect(onExpandChange).toHaveBeenCalledWith(false);

      // Test that other keys don't trigger expansion
      fireEvent.keyDown(expander, { key: "Tab" });
      expect(onExpandChange).toHaveBeenCalledTimes(2); // Should still be 2, not 3
    });
  });

  describe("Custom HTML Attributes", () => {
    it("should pass through additional HTML attributes to content", () => {
      render(
        <ExpandingContainer
          {...defaultProps}
          data-custom="test-value"
          aria-label="test-label"
        />
      );

      const content = screen.getByTestId("test-content").parentElement;
      expect(content).toHaveAttribute("data-custom", "test-value");
      expect(content).toHaveAttribute("aria-label", "test-label");
    });
  });

  describe("Performance and Memoization", () => {
    it("should be memoized component", () => {
      // Test that the component is wrapped with React.memo
      expect(ExpandingContainer.displayName).toBe("ExpandingContainer");
    });

    it("should not re-render when props don't change", () => {
      const renderSpy = vi.fn();

      const TestChild = React.memo(() => {
        renderSpy();
        return <div data-testid="test-child">Child</div>;
      });

      const { rerender } = render(
        <ExpandingContainer direction="right" expanded={true}>
          <TestChild />
        </ExpandingContainer>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <ExpandingContainer direction="right" expanded={true}>
          <TestChild />
        </ExpandingContainer>
      );

      // Child should not re-render due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing children gracefully", () => {
      render(<ExpandingContainer direction="right" />);

      const container = screen
        .getByRole("button")
        .closest(".expanding_container");
      expect(container).toBeInTheDocument();
    });

    it("should handle rapid state changes", () => {
      const onExpandChange = vi.fn();

      render(
        <ExpandingContainer
          direction="right"
          expanded={false}
          onExpandChange={onExpandChange}
        />
      );

      const expander = screen.getByRole("button");

      // Rapid clicks
      fireEvent.click(expander);
      fireEvent.click(expander);
      fireEvent.click(expander);

      expect(onExpandChange).toHaveBeenCalledTimes(3);
      expect(onExpandChange).toHaveBeenNthCalledWith(1, true);
      expect(onExpandChange).toHaveBeenNthCalledWith(2, false);
      expect(onExpandChange).toHaveBeenNthCalledWith(3, true);
    });

    it("should handle invalid maxSize gracefully", () => {
      render(
        <ExpandingContainer direction="right" maxSize="" expanded={true}>
          Content
        </ExpandingContainer>
      );

      const container = screen
        .getByText("Content")
        .closest(".expanding_container");
      expect(container).toBeInTheDocument();
    });
  });
});
