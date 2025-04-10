import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../assets/fontawsome";

export type Breakpoint = "" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";

export const WidthSizeBreakPoints: Record<Exclude<Breakpoint, "">, number> = {
  xxs: 0,
  xs: 320,
  s: 480,
  m: 768,
  l: 960,
  xl: 1280,
  xxl: 1920,
};

interface SizeContextContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

interface SizeContextContainerContextType {
  wKey: Breakpoint;
  w: number;
  h: number;
}

export const SizeContextContainerContext = React.createContext<
  SizeContextContainerContextType | undefined
>(undefined);

export const SizeContextContainer = React.forwardRef<
  HTMLDivElement,
  SizeContextContainerProps
>((props, forwardedRef) => {
  const { className, children, ...rest } = props;
  const [wKey, setwKey] = React.useState<Breakpoint>("m");
  const [w, setW] = React.useState(0);
  const [h, setH] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => containerRef.current as HTMLDivElement,
    []
  );

  const update_box = React.useCallback((contentRect: DOMRectReadOnly) => {
    const width = contentRect.width;
    const height = contentRect.height;
    let newWidthKey: Breakpoint = "xxs";
    // Loop through each breakpoint and choose the highest one that fits
    (
      Object.entries(WidthSizeBreakPoints) as [
        Exclude<Breakpoint, "">,
        number
      ][]
    ).forEach(([breakpoint, bpWidth]) => {
      if (width >= bpWidth) {
        newWidthKey = breakpoint;
      }
    });
    // Use a functional update to prevent stale closure issues.
    setwKey((prev) => (prev !== newWidthKey ? newWidthKey : prev));
    setW(width);
    setH(height);
  }, []);

  React.useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) {
      return;
    }

    // Create a ResizeObserver that will update the breakpoint based on the container's width
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        update_box(entry.contentRect);
      }
    });

    // Start observing the container
    resizeObserver.observe(observeTarget);
    update_box(observeTarget.getBoundingClientRect());

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <SizeContextContainerContext.Provider value={{ wKey, w, h }}>
      <div
        ref={containerRef}
        className={`size-context w-${wKey} ${className || ""}`.trim()}
        {...rest}
      >
        {children}
      </div>
    </SizeContextContainerContext.Provider>
  );
});

export const useSizeContext = () => {
  const context = React.useContext(SizeContextContainerContext);
  if (!context) {
    throw new Error(
      "useSizeContext must be used within a SizeContextContainerContext"
    );
  }
  return context;
};

export const breakPointSmallerThan = (a: Breakpoint, b: Breakpoint) => {
  if (a == b) return false;
  if (a == "") return true;
  if (b == "") return false;
  return WidthSizeBreakPoints[a] < WidthSizeBreakPoints[b];
};

export const currentBreakpointSmallerThan = (b: Breakpoint) => {
  return breakPointSmallerThan(useSizeContext().wKey, b);
};

export const breakPointLargerThan = (a: Breakpoint, b: Breakpoint) => {
  return breakPointSmallerThan(b, a);
};
export const currentBreakpointLargerThan = (b: Breakpoint) => {
  return breakPointSmallerThan(b, useSizeContext().wKey);
};

export type Direction = "row" | "column";
export interface FloatContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Either a string (e.g. "row" or "column") // or an object mapping breakpoints to directions.
  direction?: Direction | Partial<Record<Breakpoint, Direction>>;
  wrap?: boolean | Partial<Record<Breakpoint, boolean>>;
  grow?: boolean | Partial<Record<Breakpoint, boolean>>;
}

export const FloatContainer = ({
  direction,
  className = "",
  children,
  wrap = false,
  grow = false,
  ...rest
}: FloatContainerProps) => {
  const baseClass = "float-container";
  // Determine responsive classes let directionClasses = '';
  let directionClasses: string = "";
  if (typeof direction === "string") {
    directionClasses = `direction-${direction} `;
  } else if (typeof direction === "object" && direction !== null) {
    Object.entries(direction).forEach(([bp, dir]) => {
      if (bp === "") {
        directionClasses += `direction-${dir} `;
      } else {
        directionClasses += `${bp}-direction-${dir} `;
      }
    });
  }

  let growClasses = "";
  if (typeof grow === "boolean") {
    growClasses = grow ? "grow " : "";
  } else if (typeof grow === "object" && grow !== null) {
    Object.entries(grow).forEach(([bp, gr]) => {
      if (bp === "") {
        growClasses += gr ? "grow " : "no-grow";
      } else {
        growClasses += gr ? `${bp}-grow ` : `${bp}-no-grow`;
      }
    });
  }

  directionClasses += growClasses;

  if (wrap) {
    directionClasses += "flex-wrap ";
  }

  directionClasses = directionClasses.trim();

  const combinedClassName =
    `${baseClass} ${directionClasses} ${className}`.trim();

  return (
    <div className={combinedClassName} {...rest}>
      {children}
    </div>
  );
};

export interface ExpandingContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  direction: "up" | "down" | "left" | "right";
  expanded?: boolean;
  maxSize?: string;
  expanderSize?: string;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  style?: React.CSSProperties;
  onExpandChange?: (expanded: boolean) => void;
}
export const ExpandingContainer = ({
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
  const ExpandIcon = {
    up: ChevronUpIcon,
    down: ChevronDownIcon,
    left: ChevronLeftIcon,
    right: ChevronRightIcon,
  }[direction];
  const CollapsIcon = {
    up: ChevronDownIcon,
    down: ChevronUpIcon,
    left: ChevronRightIcon,
    right: ChevronLeftIcon,
  }[direction];

  const [_expanded, _setExpanded] = React.useState(expanded);

  const setExpanded = (expanded: boolean) => {
    if (_expanded === expanded) {
      return;
    }
    _setExpanded(expanded);
    if (onExpandChange) {
      onExpandChange(expanded);
    }
  };

  const infoclass = `${direction} ${_expanded ? "expanded" : "collapsed"}`;

  const containerstyle =
    direction === "right" || direction === "left"
      ? { width: _expanded ? maxSize : expanderSize }
      : { height: _expanded ? maxSize : expanderSize };

  const contentstyle =
    direction === "right" || direction === "left"
      ? { width: _expanded ? maxSize : 0 }
      : { height: _expanded ? maxSize : 0 };

  const expStyle =
    direction === "right" || direction === "left"
      ? { width: expanderSize }
      : { height: expanderSize };

  const content = (
    <div
      className={`expanding_container_content ${infoclass} ${
        className || ""
      }`.trim()}
      style={{ ...style, ...contentstyle }}
      {...rest}
    >
      {children}
    </div>
  );
  const expander = (
    <div
      className={`expanding_container_expander ${infoclass}`}
      onClick={() => setExpanded(!_expanded)}
      style={expStyle}
    >
      {_expanded ? <CollapsIcon /> : <ExpandIcon />}
    </div>
  );
  const comp1 =
    direction === "right" || direction === "down" ? content : expander;
  const comp2 = direction === "left" || direction === "up" ? content : expander;

  return (
    <div
      className={`expanding_container ${infoclass} ${containerClassName || ""}`}
      style={{ ...containerStyle, ...containerstyle }}
    >
      {comp1}
      {comp2}
    </div>
  );
};
