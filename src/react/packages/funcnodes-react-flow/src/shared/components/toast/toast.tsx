import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { v4 as uuidv4 } from "uuid";
import { Cross2Icon, CheckmarkIcon, ErrorIcon } from "./icons";
import {
  ToastData,
  ToastDispatcher,
  ToastPayload,
  ToastStatus,
  ToastContextValue,
  ToastsProps,
} from "./toast.types";

const ToastContext = React.createContext<ToastDispatcher | undefined>(
  undefined
);
const ToastContextImpl = React.createContext<ToastContextValue | undefined>(
  undefined
);

const ANIMATION_OUT_DURATION = 350;

export const Toasts: React.FC<
  ToastsProps & ToastPrimitive.ToastProviderProps
> = ({ children, fixedHeight, duration = 5000, maxVisible = 3, ...props }) => {
  const [toasts, setToasts] = React.useState(new Map<string, ToastData>());
  const toastElementsMapRef = React.useRef(new Map<string, HTMLElement>());
  const viewportRef = React.useRef<HTMLOListElement>(null);
  const isMounted = React.useRef(true);

  const sortToasts = React.useCallback(() => {
    const toastElements = Array.from(toastElementsMapRef.current).reverse();

    if (fixedHeight) {
      // When using fixed height, we can skip the natural height measurement
      const frontToastHeight = fixedHeight;

      toastElements.forEach(([, toast], index) => {
        if (!toast) return;

        toast.setAttribute("data-front", String(index === 0));
        toast.setAttribute("data-hidden", String(index >= maxVisible));
        toast.style.setProperty("--index", String(index));
        toast.style.setProperty("--height", `${fixedHeight}px`);
        toast.style.setProperty("--front-height", `${frontToastHeight}px`);

        const hoverOffsetY = fixedHeight * index;
        toast.style.setProperty("--hover-offset-y", `-${hoverOffsetY}px`);
      });
    } else {
      // 1. Measure natural heights of all toasts before applying any styles.
      // This prevents a feedback loop where we measure a height we've previously set.
      const naturalHeights = toastElements.map(([, toast]) => {
        if (!toast) return 0;
        const innerToast = toast.querySelector(
          ".ToastInner"
        ) as HTMLElement | null;
        if (!innerToast) return toast.clientHeight;

        // Temporarily reset height to measure the element's natural height based on its content.
        const originalHeight = innerToast.style.height;
        innerToast.style.height = "auto";
        const naturalHeight = toast.clientHeight;
        // Restore to prevent flicker before React's batch update.
        innerToast.style.height = originalHeight;
        return naturalHeight;
      });

      const frontToastHeight = naturalHeights[0] || 0;

      // 2. Apply styles to all toasts using the collected natural heights.
      toastElements.forEach(([, toast], index) => {
        if (!toast) return;

        const height = naturalHeights[index];

        toast.setAttribute("data-front", String(index === 0));
        toast.setAttribute("data-hidden", String(index >= maxVisible));
        toast.style.setProperty("--index", String(index));
        toast.style.setProperty("--height", `${height}px`);
        toast.style.setProperty("--front-height", `${frontToastHeight}px`);

        // Calculate hover offset based on the true, natural heights for correct expanded spacing.
        const hoverOffsetY = naturalHeights
          .slice(0, index)
          .reduce((res, next) => res + next, 0);
        toast.style.setProperty("--hover-offset-y", `-${hoverOffsetY}px`);
      });
    }
  }, [fixedHeight, maxVisible]);

  const handleAddToast = React.useCallback(
    (toast: ToastPayload & { status: ToastStatus }) => {
      setToasts((currentToasts) => {
        const newMap = new Map(currentToasts);
        newMap.set(uuidv4(), {
          ...toast,
          duration: toast.duration || duration,
          open: true,
        });
        return newMap;
      });
    },
    [duration]
  );

  const handleRemoveToast = React.useCallback((key: string) => {
    // Check if mounted before updating state
    if (isMounted.current) {
      setToasts((currentToasts) => {
        const newMap = new Map(currentToasts);
        newMap.delete(key);
        return newMap;
      });
    }
  }, []);

  const handleDispatchDefault = React.useCallback(
    (payload: ToastPayload) =>
      handleAddToast({ ...payload, status: payload.status || "default" }),
    [handleAddToast]
  );

  const handleDispatchSuccess = React.useCallback(
    (payload: ToastPayload) =>
      handleAddToast({ ...payload, status: "success" }),
    [handleAddToast]
  );

  const handleDispatchError = React.useCallback(
    (payload: ToastPayload) => handleAddToast({ ...payload, status: "error" }),
    [handleAddToast]
  );

  // Set the ref to false when the component unmounts
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    const viewport = viewportRef.current;

    if (viewport) {
      const handleFocus = () => {
        toastElementsMapRef.current.forEach((toast) => {
          toast.setAttribute("data-hovering", "true");
        });
      };

      const handleFocusBlur = (event: FocusEvent) => {
        if (
          !viewport.contains(event.target as Node) ||
          viewport === event.target
        ) {
          toastElementsMapRef.current.forEach((toast) => {
            toast.setAttribute("data-hovering", "false");
          });
        }
      };

      const handlePointerLeave = () => {
        toastElementsMapRef.current.forEach((toast) => {
          toast.setAttribute("data-hovering", "false");
        });
      };

      viewport.addEventListener("pointermove", handleFocus);
      viewport.addEventListener("pointerleave", handlePointerLeave);
      viewport.addEventListener("focusin", handleFocus);
      viewport.addEventListener("focusout", handleFocusBlur);
      return () => {
        viewport.removeEventListener("pointermove", handleFocus);
        viewport.removeEventListener("pointerleave", handlePointerLeave);
        viewport.removeEventListener("focusin", handleFocus);
        viewport.removeEventListener("focusout", handleFocusBlur);
      };
    }
    return undefined;
  }, []);

  // // Clear all toasts on unmount
  // React.useEffect(() => {
  //   return () => {
  //     setToasts(new Map());
  //     toastElementsMapRef.current.clear();
  //   };
  // }, []);

  const dispatcher: ToastDispatcher = React.useMemo(
    () =>
      Object.assign(handleDispatchDefault, {
        success: handleDispatchSuccess,
        error: handleDispatchError,
      }) as ToastDispatcher,
    [handleDispatchDefault, handleDispatchSuccess, handleDispatchError]
  );

  return (
    <ToastContext.Provider value={dispatcher}>
      <ToastContextImpl.Provider
        value={React.useMemo(
          () => ({
            toastElementsMapRef,
            sortToasts,
          }),
          [sortToasts]
        )}
      >
        <ToastPrimitive.Provider {...props}>
          {children}
          {Array.from(toasts).map(([key, toast]) => (
            <Toast
              key={key}
              id={key}
              toast={toast}
              onOpenChange={(open) => {
                if (!open) {
                  // Immediately remove the toast from layout calculations and re-sort the others.
                  // This makes the other toasts fill the space right away.
                  toastElementsMapRef.current.delete(key);
                  sortToasts();

                  // Set this toast's open state to false to trigger animation
                  setToasts((currentToasts) => {
                    const newMap = new Map(currentToasts);
                    const toastData = newMap.get(key);
                    if (toastData) {
                      newMap.set(key, { ...toastData, open: false });
                    }
                    return newMap;
                  });

                  // After the animation duration, remove it from the state, which will unmount it.
                  setTimeout(() => {
                    handleRemoveToast(key);
                  }, ANIMATION_OUT_DURATION);
                }
              }}
            />
          ))}
          <ToastPrimitive.Viewport
            ref={viewportRef}
            className="ToastViewport"
            style={
              fixedHeight
                ? ({
                    "--fixed-toast-height": `${fixedHeight}px`,
                  } as React.CSSProperties)
                : undefined
            }
          />
        </ToastPrimitive.Provider>
      </ToastContextImpl.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context) return context;
  throw new Error("useToast must be used within Toasts");
};

const useToastContext = () => {
  const context = React.useContext(ToastContextImpl);
  if (context) return context;
  throw new Error("useToastContext must be used within Toasts");
};

interface ToastProps extends ToastPrimitive.ToastProps {
  toast: ToastData;
  id: string;
}

const Toast: React.FC<ToastProps> = ({
  onOpenChange,
  toast,
  id,
  ...toastProps
}) => {
  const ref = React.useRef<HTMLLIElement>(null);
  const context = useToastContext();
  const { sortToasts, toastElementsMapRef } = context;
  const toastElementsMap = toastElementsMapRef.current;

  React.useLayoutEffect(() => {
    if (ref.current) {
      toastElementsMap.set(id, ref.current);
      sortToasts();
    }
    // When the component unmounts, remove it from the map and re-sort.
    return () => {
      toastElementsMap.delete(id);
      sortToasts();
    };
  }, [id, sortToasts, toastElementsMap]);

  return (
    <ToastPrimitive.Root
      {...toastProps}
      ref={ref}
      type={toast.type}
      duration={toast.duration}
      className="ToastRoot"
      onOpenChange={onOpenChange}
      open={toast.open}
    >
      <div className="ToastInner" data-status={toast.status}>
        <ToastStatusIcon status={toast.status} />
        {toast.title && (
          <ToastPrimitive.Title className="ToastTitle">
            {toast.title}
          </ToastPrimitive.Title>
        )}
        <ToastPrimitive.Description className="ToastDescription">
          {toast.description}
        </ToastPrimitive.Description>
        {toast.action && (
          <ToastPrimitive.Action
            className="ToastAction Button small green"
            altText={toast.action.altText}
            onClick={toast.action.onClick}
            asChild
          >
            <button>{toast.action.label}</button>
          </ToastPrimitive.Action>
        )}
        <ToastPrimitive.Close aria-label="Close" className="ToastClose">
          <Cross2Icon style={{ fontSize: "12px" }} />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
};

const ToastStatusIcon: React.FC<{ status?: ToastStatus }> = ({ status }) => {
  return status !== "default" && status ? (
    <div style={{ gridArea: "icon", alignSelf: "start" }}>
      {status === "success" && (
        <CheckmarkIcon style={{ color: "#61d345", fontSize: "20px" }} />
      )}
      {status === "error" && (
        <ErrorIcon style={{ color: "#ff4b4b", fontSize: "20px" }} />
      )}
    </div>
  ) : null;
};
