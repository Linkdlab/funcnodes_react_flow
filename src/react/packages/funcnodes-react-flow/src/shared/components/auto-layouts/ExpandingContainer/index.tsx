/**
 * @fileoverview ExpandingContainer - Collapsible container with directional expansion
 *
 * Provides a collapsible container component with four-directional expansion
 * support, smooth CSS transitions, and optimized performance with memoization.
 */

import * as React from "react";
import "./expanding-container.scss";
/**
 * Props for ExpandingContainer component
 */
export interface ExpandingContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of expansion */
  direction: "up" | "down" | "left" | "right";
  /** Whether container is initially expanded */
  expanded?: boolean;
  /** Maximum size when expanded */
  maxSize?: string;
  /** Size of the expander button */
  expanderSize?: string;
  /** Additional styles for the main container */
  containerStyle?: React.CSSProperties;
  /** Additional class name for the main container */
  containerClassName?: string;
  /** Additional styles for the content area */
  style?: React.CSSProperties;
  /** Icons for collapse state */
  collapseIcons?: {
    up?: (props: {}) => React.JSX.Element;
    down?: (props: {}) => React.JSX.Element;
    left?: (props: {}) => React.JSX.Element;
    right?: (props: {}) => React.JSX.Element;
  };
  /** Icons for expand state */
  expandIcons?: {
    up?: (props: {}) => React.JSX.Element;
    down?: (props: {}) => React.JSX.Element;
    left?: (props: {}) => React.JSX.Element;
    right?: (props: {}) => React.JSX.Element;
  };
  /** Callback fired when expansion state changes */
  onExpandChange?: (expanded: boolean) => void;
}

/**
 * Pre-computed icon mappings for expand state
 * Avoids recreation on each render
 */
const EXPAND_ICONS = {
  up: (_props: {}) => <>▲</>,
  down: (_props: {}) => <>▼</>,
  left: (_props: {}) => <>◀</>,
  right: (_props: {}) => <>▶</>,
} as const;

/**
 * Pre-computed icon mappings for collapse state
 * Avoids recreation on each render
 */
const COLLAPSE_ICONS = {
  up: (_props: {}) => <>▲</>,
  down: (_props: {}) => <>▼</>,
  left: (_props: {}) => <>▶</>,
  right: (_props: {}) => <>◀</>,
} as const;

/**
 * Collapsible container component with directional expansion
 *
 * Features:
 * - Four-directional expansion (up, down, left, right)
 * - Smooth CSS transitions
 * - Configurable sizes and styles
 * - Controlled and uncontrolled modes
 * - Optimized with React.memo and memoized calculations
 *
 * @component
 * @example
 * ```tsx
 * <ExpandingContainer
 *   direction="right"
 *   expanded={true}
 *   maxSize="300px"
 *   onExpandChange={(expanded) => console.log('Expanded:', expanded)}
 * >
 *   <div>Expandable content</div>
 * </ExpandingContainer>
 * ```
 */
export const ExpandingContainer = React.memo(
  ({
    direction,
    expanded = true,
    children,
    className,
    maxSize = "18.75rem",
    expanderSize = "2rem",
    containerStyle,
    style,
    containerClassName,
    expandIcons,
    collapseIcons,
    onExpandChange,
    ...rest
  }: ExpandingContainerProps) => {
    const [isExpanded, setIsExpanded] = React.useState(expanded);

    // Update internal state when prop changes
    React.useEffect(() => {
      setIsExpanded(expanded);
    }, [expanded]);

    /**
     * Handles expansion state changes with callback support
     */
    const handleExpandChange = React.useCallback(() => {
      setIsExpanded((prev) => {
        const newValue = !prev;
        onExpandChange?.(newValue);
        return newValue;
      });
    }, [onExpandChange]);

    /**
     * Handles keyboard interaction for accessibility
     */
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleExpandChange();
        }
      },
      [handleExpandChange]
    );

    // Memoize computed values for performance
    const isHorizontal = direction === "right" || direction === "left";
    const isStartDirection = direction === "left" || direction === "up";

    const Icon = isExpanded
      ? collapseIcons?.[direction] || COLLAPSE_ICONS[direction]
      : expandIcons?.[direction] || EXPAND_ICONS[direction];
    const infoClass = `${direction} ${isExpanded ? "expanded" : "collapsed"}`;

    /**
     * Memoized container dimension styles
     */
    const containerDimStyle = React.useMemo(
      () => ({
        [isHorizontal ? "width" : "height"]: isExpanded
          ? maxSize
          : expanderSize,
      }),
      [isHorizontal, isExpanded, maxSize, expanderSize]
    );

    /**
     * Memoized content dimension styles
     */
    const contentDimStyle = React.useMemo(
      () => ({
        [isHorizontal ? "width" : "height"]: isExpanded ? maxSize : 0,
      }),
      [isHorizontal, isExpanded, maxSize]
    );

    /**
     * Memoized expander dimension styles
     */
    const expanderDimStyle = React.useMemo(
      () => ({
        [isHorizontal ? "width" : "height"]: expanderSize,
      }),
      [isHorizontal, expanderSize]
    );

    const content = (
      <div
        className={`expanding_container_content ${infoClass} ${
          className || ""
        }`.trim()}
        style={{ ...style, ...contentDimStyle }}
        {...rest}
      >
        {children}
      </div>
    );

    const expander = (
      <div
        className={`expanding_container_expander ${infoClass}`}
        onClick={handleExpandChange}
        onKeyDown={handleKeyDown}
        style={expanderDimStyle}
        role="button"
        tabIndex={0}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${direction}`}
      >
        <Icon />
      </div>
    );

    return (
      <div
        className={`expanding_container ${infoClass} ${
          containerClassName || ""
        }`}
        style={{ ...containerStyle, ...containerDimStyle }}
      >
        {isStartDirection ? expander : content}
        {isStartDirection ? content : expander}
      </div>
    );
  }
);

ExpandingContainer.displayName = "ExpandingContainer";
