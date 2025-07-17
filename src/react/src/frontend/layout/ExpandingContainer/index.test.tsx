/**
 * @fileoverview Test suite for ExpandingContainer component
 * Tests for directional expansion, state management, callbacks, and performance optimizations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as React from "react";
import { ExpandingContainer, ExpandingContainerProps } from "./index";

// Mock the icon components since they're from external dependencies
vi.mock("@/icons", () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left-icon">Left</div>,
  ChevronRightIcon: () => <div data-testid="chevron-right-icon">Right</div>,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon">Down</div>,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon">Up</div>,
}));

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

        const expectedIcon = `chevron-${direction}-icon`;
        expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
      });

      it(`should show correct collapse icon for ${direction} direction when expanded`, () => {
        render(
          <ExpandingContainer
            {...defaultProps}
            direction={direction}
            expanded={true}
          />
        );

        // Map direction to opposite for collapse icon
        const oppositeDirection = {
          up: "down",
          down: "up",
          left: "right",
          right: "left",
        }[direction];

        const expectedIcon = `chevron-${oppositeDirection}-icon`;
        expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
      });
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
          expanderSize="3rem"
          expanded={false}
        />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveStyle({ width: "3rem" });
    });

    it("should apply custom containerStyle", () => {
      const customStyle = { backgroundColor: "red", margin: "10px" };

      render(
        <ExpandingContainer {...defaultProps} containerStyle={customStyle} />
      );

      const container = screen
        .getByTestId("test-content")
        .closest(".expanding_container");
      expect(container).toHaveStyle(customStyle);
    });

    it("should apply custom content style", () => {
      const customStyle = { padding: "20px", border: "1px solid blue" };

      render(<ExpandingContainer {...defaultProps} style={customStyle} />);

      const content = screen.getByTestId("test-content").parentElement;
      expect(content).toHaveStyle(customStyle);
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
