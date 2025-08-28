/**
 * @fileoverview SizeContextContainer - Responsive breakpoint context provider
 *
 * Provides responsive breakpoint context to child components with automatic
 * breakpoint detection based on container width. Optimized with debounced
 * resize handling for optimal performance.
 */

import * as React from "react";
import "./size-context-container.scss";
/**
 * Breakpoint type representing different screen size breakpoints
 * Empty string represents the default/base breakpoint
 */
export type Breakpoint = "" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";

/**
 * Pixel values for each breakpoint, defining minimum widths
 * Used for responsive behavior calculations
 */
export const WidthSizeBreakPoints = {
  xxs: 0,
  xs: 320,
  s: 480,
  m: 768,
  l: 960,
  xl: 1280,
  xxl: 1920,
} as const;

/**
 * Pre-computed sorted breakpoints for efficient O(n) lookup
 * Sorted in descending order for early-exit optimization
 */
const SORTED_BREAKPOINTS = Object.entries(WidthSizeBreakPoints).sort(
  ([, a], [, b]) => b - a
) as [Exclude<Breakpoint, "">, number][];

/**
 * Props for SizeContextContainer component
 */
interface SizeContextContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Context value providing current size information and breakpoint
 */
interface SizeContextContainerContextType {
  /** Current breakpoint key based on container width */
  wKey: Breakpoint;
  /** Current container width in pixels */
  w: number;
  /** Current container height in pixels */
  h: number;
}

/**
 * React context for sharing size information throughout the component tree
 */
export const SizeContextContainerContext = React.createContext<
  SizeContextContainerContextType | undefined
>(undefined);

/**
 * Generic debounce utility function for performance optimization
 *
 * @template T - Function type to debounce
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced version of the function
 *
 * @example
 * ```typescript
 * const debouncedResize = debounce(handleResize, 16);
 * ```
 */
const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

/**
 * Efficiently calculates the appropriate breakpoint key for a given width
 * Uses pre-sorted breakpoints array for O(n) performance with early exit
 *
 * @param width - Width in pixels to evaluate
 * @returns The appropriate breakpoint key for the width
 *
 * @example
 * ```typescript
 * const breakpoint = getBreakpointKey(800); // Returns "m"
 * ```
 */
const getBreakpointKey = (width: number): Exclude<Breakpoint, ""> => {
  for (const [breakpoint, bpWidth] of SORTED_BREAKPOINTS) {
    if (width >= bpWidth) {
      return breakpoint;
    }
  }
  return "xxs";
};

/**
 * Container component that provides responsive breakpoint context to its children
 *
 * Features:
 * - Automatic breakpoint detection based on container width
 * - Debounced resize handling for optimal performance
 * - Context provision for child components
 * - CSS classes for responsive styling
 *
 * @component
 * @example
 * ```tsx
 * <SizeContextContainer className="my-container">
 *   <ChildComponent />
 * </SizeContextContainer>
 * ```
 */
export const SizeContextContainer = React.memo(
  React.forwardRef<HTMLDivElement, SizeContextContainerProps>(
    (props, forwardedRef) => {
      const { className, children, ...rest } = props;
      const [state, setState] = React.useState<SizeContextContainerContextType>(
        {
          wKey: "m",
          w: 0,
          h: 0,
        }
      );

      const containerRef = React.useRef<HTMLDivElement>(null);
      React.useImperativeHandle(
        forwardedRef,
        () => containerRef.current as HTMLDivElement,
        []
      );

      /**
       * Updates container size state based on new dimensions
       * Only triggers re-render if dimensions or breakpoint actually changed
       */
      const updateBox = React.useCallback((contentRect: DOMRectReadOnly) => {
        const width = contentRect.width;
        const height = contentRect.height;
        const newWidthKey = getBreakpointKey(width);

        setState((prev) => {
          if (
            prev.wKey === newWidthKey &&
            prev.w === width &&
            prev.h === height
          ) {
            return prev; // No update needed
          }
          return { wKey: newWidthKey, w: width, h: height };
        });
      }, []);

      /**
       * Debounced version of updateBox for performance optimization
       * Limits updates to ~60fps (16ms intervals)
       */
      const debouncedUpdateBox = React.useMemo(
        () => debounce(updateBox, 16),
        [updateBox]
      );

      React.useEffect(() => {
        const observeTarget = containerRef.current;
        if (!observeTarget) {
          return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            debouncedUpdateBox(entry.contentRect);
          }
        });

        // Initial measurement
        updateBox(observeTarget.getBoundingClientRect());
        resizeObserver.observe(observeTarget);

        return () => {
          resizeObserver.disconnect();
        };
      }, [updateBox, debouncedUpdateBox]);

      return (
        <SizeContextContainerContext.Provider value={state}>
          <div
            ref={containerRef}
            className={`size-context w-${state.wKey} ${className || ""}`.trim()}
            {...rest}
          >
            {children}
          </div>
        </SizeContextContainerContext.Provider>
      );
    }
  )
);

SizeContextContainer.displayName = "SizeContextContainer";

/**
 * Hook to access the current size context
 *
 * @returns Current size context containing breakpoint and dimensions
 * @throws Error if used outside of SizeContextContainer
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { wKey, w, h } = useSizeContext();
 *   return <div>Current breakpoint: {wKey}</div>;
 * }
 * ```
 */
export const useSizeContext = (): SizeContextContainerContextType => {
  const context = React.useContext(SizeContextContainerContext);
  if (!context) {
    throw new Error(
      "useSizeContext must be used within a SizeContextContainerContext"
    );
  }
  return context;
};

/**
 * Compares two breakpoints to determine if the first is smaller than the second
 *
 * @param a - First breakpoint to compare
 * @param b - Second breakpoint to compare
 * @returns True if breakpoint 'a' is smaller than breakpoint 'b'
 *
 * @example
 * ```typescript
 * breakPointSmallerThan("s", "l"); // true
 * breakPointSmallerThan("xl", "m"); // false
 * ```
 */
export const breakPointSmallerThan = (
  a: Breakpoint,
  b: Breakpoint
): boolean => {
  if (a === b) return false;
  if (a === "") return true;
  if (b === "") return false;
  return WidthSizeBreakPoints[a] < WidthSizeBreakPoints[b];
};

/**
 * Checks if the current breakpoint is smaller than the provided breakpoint
 *
 * @param b - Breakpoint to compare against current
 * @returns True if current breakpoint is smaller than provided breakpoint
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isSmall = currentBreakpointSmallerThan("m");
 *   return <div>{isSmall ? "Small screen" : "Large screen"}</div>;
 * }
 * ```
 */
export const currentBreakpointSmallerThan = (b: Breakpoint): boolean => {
  const { wKey } = useSizeContext();
  return breakPointSmallerThan(wKey, b);
};

/**
 * Compares two breakpoints to determine if the first is larger than the second
 *
 * @param a - First breakpoint to compare
 * @param b - Second breakpoint to compare
 * @returns True if breakpoint 'a' is larger than breakpoint 'b'
 */
export const breakPointLargerThan = (a: Breakpoint, b: Breakpoint): boolean => {
  return breakPointSmallerThan(b, a);
};

/**
 * Checks if the current breakpoint is larger than the provided breakpoint
 *
 * @param b - Breakpoint to compare against current
 * @returns True if current breakpoint is larger than provided breakpoint
 */
export const currentBreakpointLargerThan = (b: Breakpoint): boolean => {
  const { wKey } = useSizeContext();
  return breakPointSmallerThan(b, wKey);
};
