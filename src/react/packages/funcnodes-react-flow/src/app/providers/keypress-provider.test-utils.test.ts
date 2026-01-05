import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  simulateKeyPress,
  simulateKeysDown,
  simulateKeysUp,
  simulateShortcut,
  simulateKeyCombo,
  simulateTyping,
  simulateWindowBlur,
  simulateVisibilityChange,
  createMockKeyboardEvent,
  TestKeyCominations,
  TestKeys,
  waitForAsync,
  MockEventTarget,
} from "./keypress-provider.test-utils";

const makeKeyListener = () => {
  const events: string[] = [];
  const handler = (event: KeyboardEvent) => {
    events.push(`${event.type}:${event.key}`);
  };
  return { events, handler };
};

describe("keypress-provider test utils", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("simulates key press and shortcut sequences", () => {
    const { events, handler } = makeKeyListener();

    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);

    simulateKeyPress("a");
    simulateKeysDown(["Control", "Shift"]);
    simulateKeysUp(["Control", "Shift"]);
    simulateShortcut(["Control", "c"]);

    expect(events).toContain("keydown:a");
    expect(events).toContain("keyup:a");
    expect(events).toContain("keydown:Control");
    expect(events).toContain("keyup:Shift");

    window.removeEventListener("keydown", handler);
    window.removeEventListener("keyup", handler);
  });

  it("simulates key combinations including blur", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { events, handler } = makeKeyListener();

    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);
    window.addEventListener("blur", () => events.push("blur"));

    simulateKeyCombo(["Control", "Shift"], "P");

    expect(events[0]).toBe("blur");
    expect(events).toContain("keydown:Control");
    expect(events).toContain("keydown:P");
    expect(events).toContain("keyup:P");

    window.removeEventListener("keydown", handler);
    window.removeEventListener("keyup", handler);
    consoleSpy.mockRestore();
  });

  it("simulates typing with delays", async () => {
    vi.useFakeTimers();
    const { events, handler } = makeKeyListener();

    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);

    const promise = simulateTyping("ab", window, 5);
    vi.runAllTimers();
    await promise;

    expect(events).toContain("keydown:a");
    expect(events).toContain("keyup:b");

    window.removeEventListener("keydown", handler);
    window.removeEventListener("keyup", handler);
  });

  it("simulates window blur and visibility change", () => {
    const events: string[] = [];
    window.addEventListener("blur", () => events.push("blur"));
    document.addEventListener("visibilitychange", () => events.push("visibility"));

    simulateWindowBlur();
    simulateVisibilityChange(true);

    expect(events).toEqual(["blur", "visibility"]);
    expect(document.hidden).toBe(true);
  });

  it("creates mock keyboard events with options", () => {
    const event = createMockKeyboardEvent("x", {
      ctrlKey: true,
      shiftKey: true,
      code: "KeyX",
      repeat: true,
      location: 1,
    });

    expect(event.key).toBe("x");
    expect(event.ctrlKey).toBe(true);
    expect(event.shiftKey).toBe(true);
    expect(event.repeat).toBe(true);
    expect(event.location).toBe(1);
  });

  it("exposes key combinations and key groups", () => {
    expect(TestKeyCominations.COPY).toEqual(["Control", "c"]);
    expect(TestKeys.FUNCTION_KEYS).toContain("F12");
    expect(TestKeys.UNICODE).toContain("\u20ac");
  });

  it("waits for async utilities", async () => {
    vi.useFakeTimers();
    const promise = waitForAsync(20);
    vi.advanceTimersByTime(20);
    await expect(promise).resolves.toBeUndefined();
  });

  it("tracks listeners in MockEventTarget", () => {
    const target = new MockEventTarget();
    const handler = () => undefined;

    expect(target.getListenerCount()).toBe(0);
    target.addEventListener("keydown", handler);

    expect(target.hasListener("keydown")).toBe(true);
    expect(target.getListenerCount("keydown")).toBe(1);

    target.removeEventListener("keydown", handler);
    expect(target.hasListener("keydown")).toBe(false);
  });
});
