import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  useState,
  useRef,
  useCallback,
  useMemo,
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  HTMLAttributes,
  CSSProperties,
  ReactNode,
  ReactElement,
} from "react";

/**
 * Context type for SmoothExpand component state and methods
 */
interface SmoothExpandContextType {
  /** Current expansion state */
  isExpanded: boolean;
  /** Toggle between expanded and collapsed states */
  toggleExpand: () => void;
}

const SmoothExpandContext = createContext<SmoothExpandContextType | undefined>(
  undefined
);

/**
 * Timing configuration for smooth expand animations
 */
interface AnimationTiming {
  /** Duration for horizontal animation in milliseconds */
  horizontal: number;
  /** Duration for vertical animation in milliseconds */
  vertical: number;
  /** Delay before horizontal animation starts in milliseconds */
  horizontalDelay: number;
  /** Delay before vertical animation starts in milliseconds */
  verticalDelay: number;
}

/**
 * Props for the SmoothExpand component
 */
export type SmoothExpandComponentProps = HTMLAttributes<HTMLDivElement> & {
  /** Duration for horizontal animation in milliseconds (default: 300) */
  htime?: number;
  /** Duration for vertical animation in milliseconds (default: 300) */
  vtime?: number;
  /** Delay before horizontal animation starts in milliseconds (default: 0) */
  hdelay?: number;
  /** Delay before vertical animation starts in milliseconds (default: 200) */
  vdelay?: number;
  /** Render component as its child element, merging props (default: false) */
  asChild?: boolean;
  /** Optional z-index for expanded state (default: 9999) */
  zIndex?: number;
};

/**
 * Component type with compound components
 */
interface SmoothExpandComponentType
  extends React.ForwardRefExoticComponent<
    SmoothExpandComponentProps & React.RefAttributes<HTMLDivElement>
  > {
  /** Trigger component for toggling expand/collapse */
  Trigger: React.FC<{ children: ReactNode; className?: string }>;
  /** Component that only renders when expanded */
  Expanded: React.FC<{ children: ReactNode }>;
  /** Component that only renders when collapsed */
  Collapsed: React.FC<{ children: ReactNode }>;
}

/**
 * SmoothExpand Component
 *
 * A React component that provides smooth expand/collapse animations with customizable timing.
 * When expanded, the component smoothly animates to fill the viewport. It supports compound
 * components for conditional rendering and interaction.
 *
 * @example
 * ```tsx
 * <SmoothExpand htime={400} vtime={300}>
 *   <SmoothExpand.Trigger>
 *     <button>Toggle</button>
 *   </SmoothExpand.Trigger>
 *   <SmoothExpand.Collapsed>
 *     <div>Click to expand</div>
 *   </SmoothExpand.Collapsed>
 *   <SmoothExpand.Expanded>
 *     <div>Full screen content</div>
 *   </SmoothExpand.Expanded>
 * </SmoothExpand>
 * ```
 *
 * @example With asChild prop
 * ```tsx
 * <SmoothExpand asChild>
 *   <div className="my-custom-container">
 *     <SmoothExpand.Trigger>
 *       <button>Expand</button>
 *     </SmoothExpand.Trigger>
 *   </div>
 * </SmoothExpand>
 * ```
 */
export const SmoothExpandComponent = forwardRef<
  HTMLDivElement,
  SmoothExpandComponentProps
>((props, forwardedRef) => {
  const {
    asChild = false,
    children,
    className,
    style,
    htime = 300,
    vtime = 300,
    hdelay = 0,
    vdelay = 200,
    zIndex = 9999,
    ...rest
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [animationStyles, setAnimationStyles] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const preExpandBoundsRef = useRef<DOMRect | null>(null);

  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement, []);

  // Memoize animation timing configuration
  const timing = useMemo<AnimationTiming>(
    () => ({
      horizontal: htime,
      vertical: vtime,
      horizontalDelay: hdelay,
      verticalDelay: vdelay,
    }),
    [htime, vtime, hdelay, vdelay]
  );

  /**
   * Calculate the total animation duration
   */
  const totalAnimationTime = useCallback(
    () =>
      Math.max(
        timing.horizontal + timing.horizontalDelay,
        timing.vertical + timing.verticalDelay
      ),
    [timing]
  );

  /**
   * Perform expand animation
   */
  const expand = useCallback(async () => {
    if (!ref.current) return;

    try {
      // Capture current bounds
      const rect = ref.current.getBoundingClientRect();
      preExpandBoundsRef.current = rect;

      // Set initial absolute positioning
      setAnimationStyles({
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex,
        transition: "none",
      });

      setIsExpanded(true);

      // Force reflow to ensure initial styles are applied
      ref.current.offsetHeight;

      // Set transition for animation
      setAnimationStyles((prev) => ({
        ...prev,
        transition: [
          `width ${timing.horizontal}ms ease-in-out ${timing.horizontalDelay}ms`,
          `left ${timing.horizontal}ms ease-in-out ${timing.horizontalDelay}ms`,
          `height ${timing.vertical}ms ease-in-out ${timing.verticalDelay}ms`,
          `top ${timing.vertical}ms ease-in-out ${timing.verticalDelay}ms`,
        ].join(", "),
      }));

      // Trigger expansion after a frame
      requestAnimationFrame(() => {
        setAnimationStyles((prev) => ({
          ...prev,
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
        }));
      });

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, totalAnimationTime()));
    } catch (error) {
      console.warn("Error during expand animation:", error);
      // Still set expanded state even if animation fails
      setIsExpanded(true);
    }
  }, [timing, zIndex, totalAnimationTime]);

  /**
   * Perform collapse animation
   */
  const collapse = useCallback(async () => {
    if (!ref.current || !preExpandBoundsRef.current) return;

    const originalBounds = preExpandBoundsRef.current;

    // Set transition for collapse
    setAnimationStyles((prev) => ({
      ...prev,
      transition: [
        `width ${timing.horizontal}ms ease-in-out ${timing.verticalDelay}ms`,
        `left ${timing.horizontal}ms ease-in-out ${timing.verticalDelay}ms`,
        `height ${timing.vertical}ms ease-in-out ${timing.horizontalDelay}ms`,
        `top ${timing.vertical}ms ease-in-out ${timing.horizontalDelay}ms`,
      ].join(", "),
    }));

    // Trigger collapse
    requestAnimationFrame(() => {
      setAnimationStyles((prev) => ({
        ...prev,
        top: `${originalBounds.top}px`,
        left: `${originalBounds.left}px`,
        width: `${originalBounds.width}px`,
        height: `${originalBounds.height}px`,
      }));
    });

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, totalAnimationTime()));

    // Clean up styles and state
    setAnimationStyles({});
    setIsExpanded(false);
    preExpandBoundsRef.current = null;
  }, [timing, totalAnimationTime]);

  /**
   * Toggle between expanded and collapsed states
   */
  const toggleExpand = useCallback(async () => {
    if (isExpanded) {
      await collapse();
    } else {
      await expand();
    }
  }, [isExpanded, expand, collapse]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({ isExpanded, toggleExpand }),
    [isExpanded, toggleExpand]
  );

  // Merge styles
  const mergedStyles = useMemo(
    () => ({ ...style, ...animationStyles }),
    [style, animationStyles]
  );

  // Render content
  let content: ReactElement;

  if (asChild && React.isValidElement(children)) {
    // Merge props with child element
    const childElement = children as ReactElement<any>;
    content = React.cloneElement(childElement, {
      ref,
      className: [childElement.props.className, className]
        .filter(Boolean)
        .join(" "),
      style: { ...childElement.props.style, ...mergedStyles },
      ...rest,
    });
  } else {
    // Render as wrapper div
    content = (
      <div ref={ref} className={className} style={mergedStyles} {...rest}>
        {children}
      </div>
    );
  }

  // Wrap with context provider
  const wrappedContent = (
    <SmoothExpandContext.Provider value={contextValue}>
      {content}
    </SmoothExpandContext.Provider>
  );

  // Portal to body when expanded, otherwise render in place
  return isExpanded
    ? ReactDOM.createPortal(wrappedContent, document.body)
    : wrappedContent;
}) as SmoothExpandComponentType;

SmoothExpandComponent.displayName = "SmoothExpand";

/**
 * Trigger component for toggling expand/collapse state
 *
 * Must be used within a SmoothExpand component. Renders a clickable wrapper
 * that toggles the expansion state when clicked.
 *
 * @example
 * ```tsx
 * <SmoothExpand.Trigger>
 *   <button>Click to expand</button>
 * </SmoothExpand.Trigger>
 * ```
 */
SmoothExpandComponent.Trigger = function SmoothExpandTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpand.Trigger must be used within a SmoothExpand component"
    );
  }

  return (
    <div
      className={className}
      style={{ cursor: "pointer" }}
      onClick={context.toggleExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          context.toggleExpand();
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Component that only renders its children when expanded
 *
 * Must be used within a SmoothExpand component. Children are only
 * rendered when the component is in an expanded state.
 *
 * @example
 * ```tsx
 * <SmoothExpand.Expanded>
 *   <div>This content is only visible when expanded</div>
 * </SmoothExpand.Expanded>
 * ```
 */
SmoothExpandComponent.Expanded = function SmoothExpandExpanded({
  children,
}: {
  children: ReactNode;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpand.Expanded must be used within a SmoothExpand component"
    );
  }
  return context.isExpanded ? <>{children}</> : null;
};

/**
 * Component that only renders its children when collapsed
 *
 * Must be used within a SmoothExpand component. Children are only
 * rendered when the component is in a collapsed state.
 *
 * @example
 * ```tsx
 * <SmoothExpand.Collapsed>
 *   <div>This content is only visible when collapsed</div>
 * </SmoothExpand.Collapsed>
 * ```
 */
SmoothExpandComponent.Collapsed = function SmoothExpandCollapsed({
  children,
}: {
  children: ReactNode;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpand.Collapsed must be used within a SmoothExpand component"
    );
  }
  return !context.isExpanded ? <>{children}</> : null;
};
