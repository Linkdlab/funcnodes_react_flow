/**
 * @fileoverview ExpandingContainer - Collapsible container with directional expansion
 * 
 * Provides a collapsible container component with four-directional expansion
 * support, smooth CSS transitions, and optimized performance with memoization.
 */

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/icons";

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
  /** Callback fired when expansion state changes */
  onExpandChange?: (expanded: boolean) => void;
}

/**
 * Pre-computed icon mappings for expand state
 * Avoids recreation on each render
 */
const EXPAND_ICONS = {
  up: ChevronUpIcon,
  down: ChevronDownIcon,
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
} as const;

/**
 * Pre-computed icon mappings for collapse state
 * Avoids recreation on each render
 */
const COLLAPSE_ICONS = {
  up: ChevronDownIcon,
  down: ChevronUpIcon,
  left: ChevronRightIcon,
  right: ChevronLeftIcon,
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
export const ExpandingContainer = React.memo(({
  direction,
  expanded = true,
  children,
  className,
  maxSize = "18.75rem",
  expanderSize = "2rem",
  containerStyle,
  style,
  containerClassName,
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
    setIsExpanded(prev => {
      const newValue = !prev;
      onExpandChange?.(newValue);
      return newValue;
    });
  }, [onExpandChange]);

  // Memoize computed values for performance
  const isHorizontal = direction === "right" || direction === "left";
  const isStartDirection = direction === "left" || direction === "up";
  
  const Icon = isExpanded ? COLLAPSE_ICONS[direction] : EXPAND_ICONS[direction];
  const infoClass = `${direction} ${isExpanded ? "expanded" : "collapsed"}`;
  
  /**
   * Memoized container dimension styles
   */
  const containerDimStyle = React.useMemo(() => ({
    [isHorizontal ? "width" : "height"]: isExpanded ? maxSize : expanderSize
  }), [isHorizontal, isExpanded, maxSize, expanderSize]);
  
  /**
   * Memoized content dimension styles
   */
  const contentDimStyle = React.useMemo(() => ({
    [isHorizontal ? "width" : "height"]: isExpanded ? maxSize : 0
  }), [isHorizontal, isExpanded, maxSize]);
  
  /**
   * Memoized expander dimension styles
   */
  const expanderDimStyle = React.useMemo(() => ({
    [isHorizontal ? "width" : "height"]: expanderSize
  }), [isHorizontal, expanderSize]);

  const content = (
    <div
      className={`expanding_container_content ${infoClass} ${className || ""}`.trim()}
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
      style={expanderDimStyle}
    >
      <Icon />
    </div>
  );

  return (
    <div
      className={`expanding_container ${infoClass} ${containerClassName || ""}`}
      style={{ ...containerStyle, ...containerDimStyle }}
    >
      {isStartDirection ? expander : content}
      {isStartDirection ? content : expander}
    </div>
  );
});

ExpandingContainer.displayName = "ExpandingContainer"; 