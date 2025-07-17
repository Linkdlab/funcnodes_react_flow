/**
 * @fileoverview Layout Components - A collection of responsive layout components
 *
 * This module provides a set of optimized, responsive layout components including:
 * - SizeContextContainer: Provides responsive breakpoint context
 * - FloatContainer: Flexible container with responsive direction and grow properties
 * - ExpandingContainer: Collapsible container with directional expansion
 *
 * All components are optimized for performance with memoization, debounced resize handling,
 * and efficient breakpoint calculations.
 */

// Re-export all components and types
export {
  SizeContextContainer,
  SizeContextContainerContext,
  useSizeContext,
  breakPointSmallerThan,
  currentBreakpointSmallerThan,
  breakPointLargerThan,
  currentBreakpointLargerThan,
  WidthSizeBreakPoints,
  type Breakpoint,
} from "./SizeContextContainer";

export {
  FloatContainer,
  type FloatContainerProps,
  type Direction,
} from "./FloatContainer";

export {
  ExpandingContainer,
  type ExpandingContainerProps,
} from "./ExpandingContainer";
