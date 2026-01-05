import { describe, it, expect } from "vitest";
import { create } from "zustand";
import { create_json_safe, update_zustand_store } from "./zustand-helpers";

describe("zustand-helpers", () => {
  it("updates nested state via deep merge", () => {
    type State = {
      count: number;
      nested: {
        value: string;
        inner: {
          flag: boolean;
        };
      };
    };

    const store = create<State>(() => ({
      count: 1,
      nested: { value: "alpha", inner: { flag: false } },
    }));

    const initialState = store.getState();

    update_zustand_store(store, {
      nested: { inner: { flag: true } },
    });

    const updatedState = store.getState();

    expect(updatedState).not.toBe(initialState);
    expect(updatedState.count).toBe(1);
    expect(updatedState.nested.value).toBe("alpha");
    expect(updatedState.nested.inner.flag).toBe(true);
  });

  it("does not update state when values are unchanged", () => {
    type State = {
      count: number;
      nested: { value: string };
    };

    const store = create<State>(() => ({
      count: 5,
      nested: { value: "same" },
    }));

    const initialState = store.getState();

    update_zustand_store(store, {
      count: 5,
      nested: { value: "same" },
    });

    expect(store.getState()).toBe(initialState);
  });

  it("creates a JSON-safe store with the provided state creator", () => {
    const store = create_json_safe(() => ({
      status: "ready",
      meta: { version: 1 },
    }));

    expect(store.getState()).toEqual({ status: "ready", meta: { version: 1 } });

    store.setState({ status: "updated", meta: { version: 2 } });

    expect(store.getState()).toEqual({ status: "updated", meta: { version: 2 } });
  });
});
