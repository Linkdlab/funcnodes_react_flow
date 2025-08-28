import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { deep_merge, DeepPartial } from "./object-helpers";
import { JSONObject } from "@/data-structures";

/**
 * Efficiently updates a Zustand store with partial data using deep merging.
 *
 * This utility function provides an optimized way to update Zustand stores by performing
 * a deep merge of the provided partial data with the current store state. It only triggers
 * a state update if actual changes are detected, preventing unnecessary re-renders and
 * maintaining optimal performance in React applications.
 *
 * The function uses deep merging to handle nested objects correctly, allowing you to update
 * specific properties within deeply nested structures without losing other properties at
 * the same level.
 *
 * @template T - The type of the store state. Must extend object type.
 *
 * @param store - The Zustand store instance to update. Must be a StoreApi<T> object
 *               that provides getState() and setState() methods.
 * @param new_data - Partial data to merge into the store state. Can contain any subset
 *                  of the store's properties with nested objects also being partial.
 *                  Type is DeepPartial<T>, allowing optional properties at any nesting level.
 *
 * @returns void - This function doesn't return a value. It updates the store in place
 *               if changes are detected.
 *
 * @example
 * ```typescript
 * // Define a store interface
 * interface AppState {
 *   user: {
 *     name: string;
 *     preferences: {
 *       theme: 'light' | 'dark';
 *       language: string;
 *     };
 *   };
 *   settings: {
 *     notifications: boolean;
 *     autoSave: boolean;
 *   };
 * }
 *
 * // Create a Zustand store
 * const useAppStore = create<AppState>(() => ({
 *   user: {
 *     name: 'Anonymous',
 *     preferences: { theme: 'light', language: 'en' }
 *   },
 *   settings: { notifications: true, autoSave: false }
 * }));
 *
 * // Update only the theme preference (nested update)
 * update_zustand_store(useAppStore.getState, {
 *   user: {
 *     preferences: { theme: 'dark' } // Only theme changes, language preserved
 *   }
 * });
 *
 * // Update multiple top-level properties
 * update_zustand_store(useAppStore.getState, {
 *   user: { name: 'John Doe' },
 *   settings: { notifications: false }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Performance optimization example
 * const currentState = {
 *   count: 5,
 *   data: { items: [1, 2, 3], meta: { total: 3 } }
 * };
 *
 * // This update will NOT trigger setState because values are identical
 * update_zustand_store(store, {
 *   count: 5,
 *   data: { items: [1, 2, 3] }
 * });
 *
 * // This update WILL trigger setState because values differ
 * update_zustand_store(store, {
 *   count: 6
 * });
 * ```
 *
 * @note Performance Optimization: The function uses deep_merge which compares the existing
 *       state with the new data and only calls setState if actual changes are detected.
 *       This prevents unnecessary re-renders in React components that subscribe to the store.
 *
 * @note Deep Merging Behavior: Unlike shallow merging, this function recursively merges
 *       nested objects. For example, updating { user: { name: 'John' } } will preserve
 *       other properties in the user object like user.preferences.
 *
 * @note Type Safety: The function maintains full TypeScript type safety. The new_data
 *       parameter is typed as DeepPartial<T>, ensuring you can only provide valid
 *       properties that exist in the store state structure.
 *
 * @note Store State Immutability: The function maintains Zustand's immutability requirements
 *       by creating a new state object through deep_merge rather than mutating the existing state.
 *
 * @see DeepPartial - Type that makes all properties optional recursively
 * @see deep_merge - Core function that performs the deep merging logic
 * @see StoreApi - Zustand's store interface providing getState() and setState()
 */
export const update_zustand_store = <T extends {}>(
  store: StoreApi<T>,
  new_data: DeepPartial<T>
): void => {
  const current = store.getState();
  const { new_obj, change } = deep_merge(current, new_data);
  if (change) {
    store.setState(new_obj);
  }
};

export type UseJSONStore<T extends JSONObject> = UseBoundStore<StoreApi<T>>;

export const create_json_safe = <T extends JSONObject>(
  stateCreatorFn: StateCreator<T, [], []>
): UseJSONStore<T> => {
  return create<T>(stateCreatorFn);
};
