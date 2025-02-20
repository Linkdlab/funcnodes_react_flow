import * as React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
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

interface FullScreenContextType {
  isFullScreen: boolean;
  toggleFullscreen: () => void;
}

const FullScreenContext = React.createContext<
  FullScreenContextType | undefined
>(undefined);

interface FullScreenComponentType
  extends React.ForwardRefExoticComponent<
    FullScreenComponentProps & React.RefAttributes<HTMLDivElement>
  > {
  Trigger: React.FC<{ children: React.ReactNode }>;
  InFullScreen: React.FC<{ children: React.ReactNode }>;
  OutFullScreen: React.FC<{ children: React.ReactNode }>;
}

type FullScreenComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  // You can pass additional props if needed
  asChild?: boolean; // render as child element
};
const FullScreenComponent = forwardRef<
  HTMLDivElement,
  FullScreenComponentProps
>((props, forwardedRef) => {
  const { asChild, children, className, style, ...rest } = props;
  const internalRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    forwardedRef,
    () => internalRef.current as HTMLDivElement,
    []
  );

  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle fullscreen with error handling and stable reference via useCallback.
  const toggleFullscreen = useCallback(async () => {
    try {
      const element = internalRef.current;
      if (!element) return;
      if (!isFullScreen) {
        // Request fullscreen on the container element.
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as ExtendedHTMLElement).mozRequestFullScreen) {
          await (element as ExtendedHTMLElement).mozRequestFullScreen!();
        } else if ((element as ExtendedHTMLElement).webkitRequestFullscreen) {
          await (element as ExtendedHTMLElement).webkitRequestFullscreen!();
        } else if ((element as ExtendedHTMLElement).msRequestFullscreen) {
          await (element as ExtendedHTMLElement).msRequestFullscreen!();
        }
        setIsFullScreen(true);
      } else {
        // Exit fullscreen mode.
        const doc = document as ExtendedDocument;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setIsFullScreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen", error);
    }
  }, [isFullScreen]);

  // Sync state with external fullscreen changes (e.g., ESC key).
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Use document.fullscreenElement for modern browsers.
      const fsElement = document.fullscreenElement;
      setIsFullScreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  let content;
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>;
    const mergedClassName = [childElement.props.className, className]
      .filter(Boolean)
      .join(" ");
    const mergedStyle = { ...childElement.props.style, ...style };
    content = React.cloneElement(childElement, {
      ref: internalRef,
      className: mergedClassName,
      style: mergedStyle,
      ...rest,
    });
  } else {
    content = (
      <div ref={internalRef} {...rest} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <FullScreenContext.Provider value={{ isFullScreen, toggleFullscreen }}>
      {content}
    </FullScreenContext.Provider>
  );
}) as FullScreenComponentType;

// Compound subcomponent for the trigger
FullScreenComponent.Trigger = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = React.useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreenComponent.Trigger must be used within a FullScreenComponent"
    );
  }

  return (
    <div style={{ cursor: "pointer" }} onClick={context.toggleFullscreen}>
      {children}
    </div>
  );
};

// Subcomponent to show content only when expanded
FullScreenComponent.InFullScreen = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = React.useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreenComponent.Expanded must be used within a FullScreenComponent"
    );
  }
  return context.isFullScreen ? <>{children}</> : null;
};

// Subcomponent to show content only when collapsed
FullScreenComponent.OutFullScreen = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = React.useContext(FullScreenContext);
  if (!context) {
    throw new Error(
      "FullScreenComponent.Collapsed must be used within a FullScreenComponent"
    );
  }
  return !context.isFullScreen ? <>{children}</> : null;
};

export default FullScreenComponent;
