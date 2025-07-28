/**
 * @fileoverview FloatContainer - Flexible responsive container component
 *
 * Provides flexible container with responsive direction, wrap, and grow properties.
 * Optimized with React.memo and efficient class generation utilities.
 */

import * as React from "react";
import { Breakpoint } from "../SizeContextContainer";
import "./float-container.scss";
/**
 * Direction type for flex layout
 */
export type Direction = "row" | "column";

/**
 * Props for FloatContainer component
 */
export interface FloatContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction - can be a string or responsive object
   * @example
   * ```tsx
   * direction="row"
   * direction={{ "": "column", "m": "row" }}
   * ```
   */
  direction?: Direction | Partial<Record<Breakpoint, Direction>>;
  /**
   * Whether children should wrap - can be boolean or responsive object
   * @example
   * ```tsx
   * wrap={true}
   * wrap={{ "": false, "s": true }}
   * ```
   */
  wrap?: boolean | Partial<Record<Breakpoint, boolean>>;
  /**
   * Whether container should grow - can be boolean or responsive object
   * @example
   * ```tsx
   * grow={true}
   * grow={{ "": false, "m": true }}
   * ```
   */
  grow?: boolean | Partial<Record<Breakpoint, boolean>>;
}

/**
 * Utility function to build responsive CSS classes from props
 *
 * @param prop - Property value (string, boolean, or responsive object)
 * @param prefix - CSS class prefix
 * @param truthyValue - Class name for truthy boolean values
 * @param falsyValue - Class name for falsy boolean values
 * @returns Space-separated string of CSS classes
 *
 * @example
 * ```typescript
 * buildResponsiveClasses("row", "direction"); // "direction-row"
 * buildResponsiveClasses({ "": false, "m": true }, "", "grow", "no-grow"); // "no-grow m-grow"
 * ```
 */
const buildResponsiveClasses = (
  prop:
    | string
    | boolean
    | Partial<Record<Breakpoint, string | boolean>>
    | undefined,
  prefix: string,
  truthyValue: string = "",
  falsyValue: string = ""
): string => {
  const classes: string[] = [];

  if (typeof prop === "string") {
    classes.push(`${prefix}-${prop}`);
  } else if (typeof prop === "boolean") {
    classes.push(prop ? truthyValue : falsyValue);
  } else if (prop && typeof prop === "object") {
    Object.entries(prop).forEach(([bp, value]) => {
      if (typeof value === "string") {
        classes.push(
          bp === "" ? `${prefix}-${value}` : `${bp}-${prefix}-${value}`
        );
      } else if (typeof value === "boolean") {
        const classValue = value ? truthyValue : falsyValue;
        if (classValue) {
          classes.push(bp === "" ? classValue : `${bp}-${classValue}`);
        }
      }
    });
  }

  return classes.filter(Boolean).join(" ");
};

/**
 * Flexible container component with responsive direction, wrap, and grow properties
 *
 * Features:
 * - Responsive flex direction
 * - Responsive flex-wrap behavior
 * - Responsive flex-grow behavior
 * - Optimized with React.memo
 *
 * @component
 * @example
 * ```tsx
 * <FloatContainer
 *   direction={{ "": "column", "m": "row" }}
 *   wrap={true}
 *   grow={{ "": false, "l": true }}
 * >
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 * </FloatContainer>
 * ```
 */
export const FloatContainer = React.memo(
  ({
    direction,
    className = "",
    children,
    wrap = false,
    grow = false,
    ...rest
  }: FloatContainerProps) => {
    const baseClass = "float-container";

    // Build responsive classes using utility
    const directionClasses = buildResponsiveClasses(direction, "direction");
    const growClasses = buildResponsiveClasses(grow, "", "grow", "no-grow");
    const wrapClasses = typeof wrap === "boolean" && wrap ? "flex-wrap" : "";

    const combinedClassName = [
      baseClass,
      directionClasses,
      growClasses,
      wrapClasses,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={combinedClassName} {...rest}>
        {children}
      </div>
    );
  }
);

FloatContainer.displayName = "FloatContainer";
