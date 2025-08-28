import { fireEvent, act } from "@testing-library/react";

/**
 * Test utilities for keypress provider testing
 */

/**
 * Simulates a key press (down + up) sequence
 */
export const simulateKeyPress = (
  key: string,
  target: Window | Document | Element = window
) => {
  act(() => {
    fireEvent.keyDown(target, { key });
    fireEvent.keyUp(target, { key });
  });
};

/**
 * Simulates multiple keys being pressed down simultaneously
 */
export const simulateKeysDown = (
  keys: string[],
  target: Window | Document | Element = window
) => {
  act(() => {
    keys.forEach((key) => {
      fireEvent.keyDown(target, { key });
    });
  });
};

/**
 * Simulates multiple keys being released simultaneously
 */
export const simulateKeysUp = (
  keys: string[],
  target: Window | Document | Element = window
) => {
  act(() => {
    keys.forEach((key) => {
      fireEvent.keyUp(target, { key });
    });
  });
};

/**
 * Simulates a keyboard shortcut (press multiple keys, then release them)
 */
export const simulateShortcut = (
  keys: string[],
  target: Window | Document | Element = window
) => {
  simulateKeysDown(keys, target);
  simulateKeysUp(keys, target);
};

/**
 * Simulates a key combination (multiple keys held down, then one specific action key)
 */
export const simulateKeyCombo = (
  modifierKeys: string[],
  actionKey: string,
  target: Window | Document | Element = window
) => {
  console.log(`UTIL: simulateKeyCombo called with modifiers: ${modifierKeys.join('+')}, action: ${actionKey}`);

  // Clear any existing keys first
  console.log("UTIL: Clearing existing keys with blur");
  act(() => {
    fireEvent.blur(target);
  });
  console.log("UTIL: Blur completed");

  console.log("UTIL: Pressing keys down");
  act(() => {
    // Press modifiers
    modifierKeys.forEach((key) => {
      console.log(`UTIL: Pressing modifier key: ${key}`);
      fireEvent.keyDown(target, { key });
    });

    // Press action key
    console.log(`UTIL: Pressing action key: ${actionKey}`);
    fireEvent.keyDown(target, { key: actionKey });
  });
  console.log("UTIL: All keys pressed down");

  console.log("UTIL: Releasing keys");
  act(() => {
    // Release action key
    console.log(`UTIL: Releasing action key: ${actionKey}`);
    fireEvent.keyUp(target, { key: actionKey });

    // Release modifiers
    modifierKeys.forEach((key) => {
      console.log(`UTIL: Releasing modifier key: ${key}`);
      fireEvent.keyUp(target, { key });
    });
  });
  console.log("UTIL: All keys released, simulateKeyCombo completed");
};

/**
 * Simulates rapid key typing
 */
export const simulateTyping = (
  text: string,
  target: Window | Document | Element = window,
  delay = 10
) => {
  return new Promise<void>((resolve) => {
    let index = 0;

    const typeNext = () => {
      if (index >= text.length) {
        resolve();
        return;
      }

      const char = text[index];
      simulateKeyPress(char, target);
      index++;

      setTimeout(typeNext, delay);
    };

    typeNext();
  });
};

/**
 * Simulates window blur event
 */
export const simulateWindowBlur = () => {
  act(() => {
    fireEvent.blur(window);
  });
};

/**
 * Simulates tab visibility change
 */
export const simulateVisibilityChange = (hidden: boolean) => {
  act(() => {
    Object.defineProperty(document, "hidden", {
      writable: true,
      value: hidden,
    });
    fireEvent(document, new Event("visibilitychange"));
  });
};

/**
 * Creates a mock keyboard event with additional properties
 */
export const createMockKeyboardEvent = (
  key: string,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    repeat?: boolean;
    code?: string;
    location?: number;
  } = {}
) => {
  const event = new KeyboardEvent("keydown", {
    key,
    code: options.code || `Key${key.toUpperCase()}`,
    ctrlKey: options.ctrlKey || false,
    shiftKey: options.shiftKey || false,
    altKey: options.altKey || false,
    metaKey: options.metaKey || false,
    repeat: options.repeat || false,
    location: options.location || 0,
    bubbles: true,
    cancelable: true,
  });

  return event;
};

/**
 * Test data for common key combinations
 */
export const TestKeyCominations = {
  COPY: ["Control", "c"],
  PASTE: ["Control", "v"],
  CUT: ["Control", "x"],
  UNDO: ["Control", "z"],
  REDO: ["Control", "Shift", "z"],
  SAVE: ["Control", "s"],
  SAVE_AS: ["Control", "Shift", "s"],
  SELECT_ALL: ["Control", "a"],
  FIND: ["Control", "f"],
  NEW_TAB: ["Control", "t"],
  CLOSE_TAB: ["Control", "w"],
  REFRESH: ["Control", "r"],
  DEV_TOOLS: ["F12"],
  FULL_SCREEN: ["F11"],
} as const;

/**
 * Test data for special keys
 */
export const TestKeys = {
  FUNCTION_KEYS: [
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
  ],
  ARROW_KEYS: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  MODIFIER_KEYS: ["Control", "Shift", "Alt", "Meta"],
  NAVIGATION_KEYS: ["Home", "End", "PageUp", "PageDown"],
  EDITING_KEYS: ["Backspace", "Delete", "Insert"],
  WHITESPACE_KEYS: [" ", "Tab", "Enter"],
  PUNCTUATION: [".", ",", ";", ":", "!", "?", '"', "'"],
  NUMBERS: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  LETTERS: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ],
  SPECIAL_CHARS: [
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "-",
    "+",
    "=",
    "[",
    "]",
    "{",
    "}",
    "|",
    "\\",
    "/",
    "<",
    ">",
  ],
  UNICODE: ["é", "ñ", "ü", "€", "£", "¥", "한", "中", "日", "🔥", "💻", "🚀"],
} as const;

/**
 * Helper to wait for async operations in tests
 */
export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock event target for testing custom targets
 */
export class MockEventTarget extends EventTarget {
  public listeners: Map<string, Set<EventListenerOrEventListenerObject>> =
    new Map();

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener, options);

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    super.removeEventListener(type, listener, options);

    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  getListenerCount(type?: string): number {
    if (type) {
      return this.listeners.get(type)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce(
      (total, set) => total + set.size,
      0
    );
  }

  hasListener(type: string): boolean {
    return this.listeners.has(type) && this.listeners.get(type)!.size > 0;
  }
}
