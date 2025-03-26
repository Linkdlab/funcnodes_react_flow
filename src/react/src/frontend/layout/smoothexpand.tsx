import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  useState,
  useRef,
  HTMLAttributes,
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
} from "react";


interface SmoothExpandContextType {
  isExpanded: boolean;
  toggleExpand: () => void;
}

const SmoothExpandContext = createContext<SmoothExpandContextType | undefined>(
  undefined
);

interface SmoothExpandComponentType
  extends React.ForwardRefExoticComponent<
    SmoothExpandComponentProps & React.RefAttributes<HTMLDivElement>
  > {
  Trigger: React.FC<{ children: React.ReactNode }>;
  Expanded: React.FC<{ children: React.ReactNode }>;
  Collapsed: React.FC<{ children: React.ReactNode }>;
}

type SmoothExpandComponentProps = HTMLAttributes<HTMLDivElement> & {
  // You can pass additional props if needed
  htime?: number;
  vtime?: number;
  hdelay?: number;
  vdelay?: number;
  asChild?: boolean; // render as child element
};

const SmoothExpandComponent = forwardRef<
  HTMLDivElement,
  SmoothExpandComponentProps
>((props, forwardedRef) => {
  const { asChild, children, className, style, ...rest } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [preExpandBounds, setPreExpandBounds] = useState<
    [number, number, number, number] | null
  >(null);
  const [inlineStyles, setInlineStyles] = useState<React.CSSProperties>({});
  const htime = props.htime || 300;
  const vtime = props.vtime || 300;
  const hdelay = props.hdelay || 0;
  const vdelay = props.vdelay || 200;

  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement, []);

  const expand = async () => {
    // Expand process:
    if (!ref.current) return;
    // reset everything to initial state
    ref.current.style.transition = `none`;
    ref.current.style.position = "";
    ref.current.style.top = "";
    ref.current.style.left = "";
    ref.current.style.width = "";
    ref.current.style.height = "";

    const rect = ref.current.getBoundingClientRect();
    setPreExpandBounds([rect.left, rect.top, rect.width, rect.height]);

    // set the styles for expanding
    ref.current.style.transition = `none`;
    setInlineStyles({
      position: "absolute",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });

    setInlineStyles((prev) => ({
      ...prev,
      transitionProperty: `width, left, height, top`,
      transitionDuration: `${htime}ms, ${htime}ms, ${vtime}ms, ${vtime}ms`,
    }));
    setIsExpanded(true);

    const h_expand = new Promise<void>((resolve) => {
      setTimeout(() => {
        setInlineStyles((prev) => ({
          ...prev,
          left: `0px`,
          width: `100vw`,
        }));

        resolve();
      }, hdelay);
    });

    const v_expand = new Promise<void>((resolve) => {
      setTimeout(() => {
        setInlineStyles((prev) => ({
          ...prev,
          top: `0px`,
          height: `100vh`,
        }));
        resolve();
      }, vdelay);
    });

    const totalexpandtime = Math.max(htime + hdelay, vtime + vdelay);

    const allwait = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, totalexpandtime);
    });

    await Promise.all([h_expand, v_expand, allwait]);
  };

  const collapse = async () => {
    // Collapse process:
    if (!ref.current) return;
    if (!preExpandBounds) return; // Ensure we have the original bounds.
    // Set up transition properties for the collapse.
    const style: React.CSSProperties = {
      transitionProperty: `width, left, height, top`,
      transitionDuration: `${htime}ms, ${htime}ms, ${vtime}ms, ${vtime}ms`,
    };
    setInlineStyles((prev) => ({
      ...prev,
      ...style,
    }));

    const [originalLeft, originalTop, originalWidth, originalHeight] =
      preExpandBounds;

    const h_collapse = new Promise<void>((resolve) => {
      setTimeout(() => {
        setInlineStyles((prev) => ({
          ...prev,
          left: `${originalLeft}px`,
          width: `${originalWidth}px`,
        }));
        resolve();
      }, vdelay);
    });

    const v_collapse = new Promise<void>((resolve) => {
      setTimeout(() => {
        setInlineStyles((prev) => ({
          ...prev,
          top: `${originalTop}px`,
          height: `${originalHeight}px`,
        }));
        resolve();
      }, hdelay);
    });

    const totalCollapseTime = Math.max(htime + hdelay, vtime + vdelay);
    const allWait = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, totalCollapseTime);
    });

    await Promise.all([h_collapse, v_collapse, allWait]);
    // Remove transition and inline styles after the collapse animation.
    ref.current.style.transition = "";
    setInlineStyles({});

    // Finally, update the state to indicate collapse.
    setIsExpanded(false);
  };

  const toggleExpand = async () => {
    if (!ref.current) return;

    if (!isExpanded) {
      await expand();
    } else {
      await collapse();
    }
  };

  // Render inner element using asChild if true.
  // Render inner element using asChild if true.
  let innerContent;
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>;
    const mergedClassName = [
      childElement.props.className,
      className,
      "smooth-expand",
      isExpanded ? "smooth-expand-expanded" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const mergedStyle = {
      ...childElement.props.style,
      ...style,
      ...inlineStyles,
    };
    innerContent = React.cloneElement(childElement, {
      ref: ref,
      className: mergedClassName,
      style: mergedStyle,
      ...rest,
    });
  } else {
    innerContent = (
      <div
        ref={ref}
        {...rest}
        className={`smooth-expand ${
          isExpanded ? "smooth-expand-expanded" : ""
        } ${className || ""}`}
        style={{ ...style, ...inlineStyles }}
      >
        {children}
      </div>
    );
  }

  const content = (
    <SmoothExpandContext.Provider value={{ isExpanded, toggleExpand }}>
      {innerContent}
    </SmoothExpandContext.Provider>
  );

  return isExpanded ? ReactDOM.createPortal(content, document.body) : content;
}) as SmoothExpandComponentType;

// Compound subcomponent for the trigger
SmoothExpandComponent.Trigger = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpandComponent.Trigger must be used within a SmoothExpandComponent"
    );
  }
  return (
    <div style={{ cursor: "pointer" }} onClick={context.toggleExpand}>
      {children}
    </div>
  );
};

// Subcomponent to show content only when expanded
SmoothExpandComponent.Expanded = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpandComponent.Expanded must be used within a SmoothExpandComponent"
    );
  }
  return context.isExpanded ? <>{children}</> : null;
};

// Subcomponent to show content only when collapsed
SmoothExpandComponent.Collapsed = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(SmoothExpandContext);
  if (!context) {
    throw new Error(
      "SmoothExpandComponent.Collapsed must be used within a SmoothExpandComponent"
    );
  }
  return !context.isExpanded ? <>{children}</> : null;
};

export default SmoothExpandComponent;
