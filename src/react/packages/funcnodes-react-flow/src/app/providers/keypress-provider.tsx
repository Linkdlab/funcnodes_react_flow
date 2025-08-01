import * as React from "react";

/**
 * Represents the state of currently pressed keys
 */
export interface KeyPressState {
  /** Set of currently pressed keys */
  keys: ReadonlySet<string>;
  /** Check if a specific key is currently pressed */
  isKeyPressed: (key: string) => boolean;
  /** Check if all specified keys are currently pressed */
  areKeysPressed: (...keys: string[]) => boolean;
  /** Check if any of the specified keys are currently pressed */
  isAnyKeyPressed: (...keys: string[]) => boolean;
}

/**
 * Context for providing keyboard state throughout the application
 */
const KeyPressContext = React.createContext<KeyPressState | undefined>(
  undefined
);

/**
 * Hook to access the current keyboard state
 * @throws {Error} If used outside of KeyPressProvider
 */
export const useKeyPress = (): KeyPressState => {
  const context = React.useContext(KeyPressContext);
  if (!context) {
    throw new Error("useKeyPress must be used within a KeyPressProvider");
  }
  return context;
};

/**
 * Hook to check if a specific key is currently pressed
 * @param key - The key to check (e.g., "Enter", "a", "Control")
 * @returns Boolean indicating if the key is pressed
 */
export const useIsKeyPressed = (key: string): boolean => {
  const { isKeyPressed } = useKeyPress();
  return isKeyPressed(key);
};

/**
 * Configuration options for the KeyPressProvider
 */
export interface KeyPressProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Whether to prevent default behavior for tracked keys (default: false) */
  preventDefault?: boolean;
  /** Keys to ignore (e.g., ["Tab", "Alt"] for accessibility) */
  ignoredKeys?: string[];
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Custom target element (default: window) */
  target?: HTMLElement | Window | null;
}

/**
 * Provider component that tracks keyboard state
 */
export const KeyPressProvider: React.FC<KeyPressProviderProps> = ({
  children,
  preventDefault = false,
  ignoredKeys = [],
  debug = false,
  target,
}) => {
  const [pressedKeys, setPressedKeys] = React.useState<Set<string>>(new Set());
  const ignoredKeysSet = React.useMemo(
    () => new Set(ignoredKeys),
    [ignoredKeys]
  );

  // Use refs to avoid recreating functions on every render
  const pressedKeysRef = React.useRef(pressedKeys);
  pressedKeysRef.current = pressedKeys;

  const contextValue = React.useMemo<KeyPressState>(
    () => ({
      keys: pressedKeys,
      isKeyPressed: (key: string) => pressedKeys.has(key),
      areKeysPressed: (...keys: string[]) =>
        keys.every((key) => pressedKeys.has(key)),
      isAnyKeyPressed: (...keys: string[]) =>
        keys.some((key) => pressedKeys.has(key)),
    }),
    [pressedKeys]
  );

  React.useEffect(() => {
    const targetElement = target ?? window;
    if (!targetElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      // Ignore specified keys
      if (ignoredKeysSet.has(key)) return;

      // Prevent default if configured
      if (preventDefault) {
        event.preventDefault();
      }

      // Only update if key is not already pressed (avoid repeat events)
      if (!pressedKeysRef.current.has(key)) {
        if (debug) {
          console.log(`[KeyPress] Key down: ${key}`);
        }

        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;

      // Only update if key was pressed
      if (pressedKeysRef.current.has(key)) {
        if (debug) {
          console.log(`[KeyPress] Key up: ${key}`);
        }

        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    };

    const handleBlur = () => {
      // Clear all keys on blur to prevent stuck keys
      if (pressedKeysRef.current.size > 0) {
        if (debug) {
          console.log("[KeyPress] Window blur - clearing all keys");
        }
        setPressedKeys(new Set());
      }
    };

    const handleVisibilityChange = () => {
      // Clear keys when tab becomes hidden
      if (document.hidden && pressedKeysRef.current.size > 0) {
        if (debug) {
          console.log("[KeyPress] Tab hidden - clearing all keys");
        }
        setPressedKeys(new Set());
      }
    };

    // Add event listeners
    targetElement.addEventListener("keydown", handleKeyDown as any);
    targetElement.addEventListener("keyup", handleKeyUp as any);
    targetElement.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      targetElement.removeEventListener("keydown", handleKeyDown as any);
      targetElement.removeEventListener("keyup", handleKeyUp as any);
      targetElement.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [preventDefault, ignoredKeysSet, debug, target]);

  return (
    <KeyPressContext.Provider value={contextValue}>
      {children}
    </KeyPressContext.Provider>
  );
};

/**
 * Higher-order component that provides key press props
 */
export function withKeyPress<P extends object>(
  Component: React.ComponentType<P & KeyPressState>
): React.FC<Omit<P, keyof KeyPressState>> {
  return (props: Omit<P, keyof KeyPressState>) => {
    const keyPressState = useKeyPress();
    return <Component {...(props as P)} {...keyPressState} />;
  };
}

/**
 * Utility hook for keyboard shortcuts
 * @param shortcuts - Object mapping key combinations to callbacks
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export const useKeyboardShortcuts = (
  shortcuts: Record<string, () => void>,
  enabled = true
) => {
  const { keys } = useKeyPress();

  React.useEffect(() => {
    if (!enabled) return;

    // Check each shortcut
    Object.entries(shortcuts).forEach(([shortcut, callback]) => {
      const requiredKeys = shortcut.split("+").map((k) => k.trim());
      const allPressed = requiredKeys.every((key) => keys.has(key));

      if (allPressed && keys.size === requiredKeys.length) {
        callback();
      }
    });
  }, [keys, shortcuts, enabled]);
};

/**
 * Common key constants for better readability
 */
export const Keys = {
  ENTER: "Enter",
  ESCAPE: "Escape",
  SPACE: " ",
  TAB: "Tab",
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  SHIFT: "Shift",
  CONTROL: "Control",
  ALT: "Alt",
  META: "Meta",
  COMMAND: "Meta", // Alias for Mac users
  CTRL: "Control", // Alias
} as const;

/**
 * Type for key constants
 */
export type KeyConstant = (typeof Keys)[keyof typeof Keys];
