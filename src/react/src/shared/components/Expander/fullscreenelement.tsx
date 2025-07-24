import * as React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  createContext,
  useContext,
  useMemo,
  HTMLAttributes,
  ReactNode,
  ReactElement,
} from "react";

// Extend HTMLElement to include vendor-prefixed methods
interface ExtendedHTMLElement extends HTMLDivElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

// Extend Document to include vendor-prefixed methods
interface ExtendedDocument extends Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

/**
 * Context type for FullScreen component state and methods
 */
interface FullScreenContextType {
  /** Current fullscreen state */
  isFullScreen: boolean;
  /** Toggle between fullscreen and normal states */
  toggleFullscreen: () => Promise<void>;
}

const FullScreenContext = createContext<FullScreenContextType | undefined>(
  undefined
);

/**
 * Props for the FullScreen component
 */
export type FullScreenComponentProps = HTMLAttributes<HTMLDivElement> & {
  /** Render component as its child element, merging props (default: false) */
  asChild?: boolean;
};

/**
 * Component type with compound components
 */
interface FullScreenComponentType
  extends React.ForwardRefExoticComponent<
    FullScreenComponentProps & React.RefAttributes<HTMLDivElement>
  > {
  /** Trigger component for toggling fullscreen mode */
  Trigger: React.FC<{ children: ReactNode; className?: string }>;
  /** Component that only renders when in fullscreen mode */
  InFullScreen: React.FC<{ children: ReactNode }>;
  /** Component that only renders when not in fullscreen mode */
  OutFullScreen: React.FC<{ children: ReactNode }>;
}

/**
 * FullScreen Component
 *
 * A React component that provides fullscreen functionality with compound components
 * for conditional rendering and interaction. Supports cross-browser compatibility
 * with vendor-prefixed fullscreen APIs.
 *
 * @example
 * ```tsx
 * <FullScreen>
 *   <FullScreen.Trigger>
 *     <button>Toggle Fullscreen</button>
 *   </FullScreen.Trigger>
 *   <FullScreen.OutFullScreen>
 *     <div>Click to go fullscreen</div>
 *   </FullScreen.OutFullScreen>
 *   <FullScreen.InFullScreen>
 *     <div>Currently in fullscreen mode</div>
 *   </FullScreen.InFullScreen>
 * </FullScreen>
 * ```
 *
 * @example With asChild prop
 * ```tsx
 * <FullScreen asChild>
 *   <div className="my-video-player">
 *     <FullScreen.Trigger>
 *       <button>Fullscreen</button>
 *     </FullScreen.Trigger>
 *   </div>
 * </FullScreen>
 * ```
 */
export const FullScreenComponent = forwardRef<
  HTMLDivElement,
  FullScreenComponentProps
>((props, forwardedRef) => {
  const { asChild = false, children, className, style, ...rest } = props;

  const [isFullScreen, setIsFullScreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement, []);

  /**
   * Request fullscreen mode with cross-browser support
   */
  const requestFullscreen = useCallback(async (element: HTMLDivElement) => {
    const extendedElement = element as ExtendedHTMLElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (extendedElement.mozRequestFullScreen) {
      await extendedElement.mozRequestFullScreen();
    } else if (extendedElement.webkitRequestFullscreen) {
      await extendedElement.webkitRequestFullscreen();
    } else if (extendedElement.msRequestFullscreen) {
      await extendedElement.msRequestFullscreen();
    } else {
      throw new Error("Fullscreen API is not supported in this browser");
    }
  }, []);

  /**
   * Exit fullscreen mode with cross-browser support
   */
  const exitFullscreen = useCallback(async () => {
    const doc = document as ExtendedDocument;

    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    } else {
      throw new Error("Exit fullscreen API is not supported in this browser");
    }
  }, []);

  /**
   * Toggle between fullscreen and normal states
   */
  const toggleFullscreen = useCallback(async () => {
    try {
      const element = ref.current;
      if (!element) {
        console.warn("FullScreen: No element reference available");
        return;
      }

      if (!isFullScreen) {
        await requestFullscreen(element);
      } else {
        await exitFullscreen();
      }
    } catch (error) {
      console.error("FullScreen: Error toggling fullscreen mode", error);
    }
  }, [isFullScreen, requestFullscreen, exitFullscreen]);

  /**
   * Handle fullscreen change events from the browser
   */
  const handleFullscreenChange = useCallback(() => {
    // Check if any element is currently in fullscreen mode
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    setIsFullScreen(isCurrentlyFullscreen);
  }, []);

  // Set up fullscreen change event listeners
  useEffect(() => {
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [handleFullscreenChange]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ isFullScreen, toggleFullscreen }),
    [isFullScreen, toggleFullscreen]
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
      style: { ...childElement.props.style, ...style },
      ...rest,
    });
  } else {
    // Render as wrapper div
    content = (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <FullScreenContext.Provider value={contextValue}>
      {content}
    </FullScreenContext.Provider>
  );
}) as FullScreenComponentType;

FullScreenComponent.displayName = "FullScreen";

/**
 * Trigger component for toggling fullscreen mode
 *
 * Must be used within a FullScreen component. Renders a clickable wrapper
 * that toggles the fullscreen state when clicked.
 *
 * @example
 * ```tsx
 * <FullScreen.Trigger>
 *   <button>Enter Fullscreen</button>
 * </FullScreen.Trigger>
 * ```
 */
FullScreenComponent.Trigger = function FullScreenTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreen.Trigger must be used within a FullScreen component"
    );
  }

  return (
    <div
      className={className}
      style={{ cursor: "pointer" }}
      onClick={context.toggleFullscreen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          context.toggleFullscreen();
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Component that only renders its children when in fullscreen mode
 *
 * Must be used within a FullScreen component. Children are only
 * rendered when the component is in fullscreen mode.
 *
 * @example
 * ```tsx
 * <FullScreen.InFullScreen>
 *   <div>This content is only visible in fullscreen</div>
 * </FullScreen.InFullScreen>
 * ```
 */
FullScreenComponent.InFullScreen = function FullScreenInFullScreen({
  children,
}: {
  children: ReactNode;
}) {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreen.InFullScreen must be used within a FullScreen component"
    );
  }
  return context.isFullScreen ? <>{children}</> : null;
};

/**
 * Component that only renders its children when not in fullscreen mode
 *
 * Must be used within a FullScreen component. Children are only
 * rendered when the component is not in fullscreen mode.
 *
 * @example
 * ```tsx
 * <FullScreen.OutFullScreen>
 *   <div>This content is only visible when not in fullscreen</div>
 * </FullScreen.OutFullScreen>
 * ```
 */
FullScreenComponent.OutFullScreen = function FullScreenOutFullScreen({
  children,
}: {
  children: ReactNode;
}) {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreen.OutFullScreen must be used within a FullScreen component"
    );
  }
  return !context.isFullScreen ? <>{children}</> : null;
};

export default FullScreenComponent;
