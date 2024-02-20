import LibZustand, { LibZustandInterface } from "./lib";
import NodeSpaceZustand, { NodeSpaceZustandInterface } from "./nodespace";
import { FuncNodesReactFlowZustandInterface } from "./fnrfzst";
import FuncNodesReactFlowZustand from "./fnrfzst";
export default FuncNodesReactFlowZustand;
export { LibZustand, NodeSpaceZustand };
export type { FuncNodesReactFlowZustandInterface };

// Type alias for DeepPartial. It makes all properties of T optional and recursive.
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * A generic function to deeply merge two objects of type T.
 *
 * @param {T} target - The target object to be merged.
 * @param {DeepPartial<T>} source - The source object to merge into the target. All properties of this object are optional.
 *
 * @returns {Object} An object containing the merged object (new_obj) and a boolean indicating if there was a change (change).
 *
 * @throws {Type 'string' cannot be used to index type 'T'} This error is ignored using the @ts-ignore directive because we are dynamically accessing properties of a generic type T.
 */
const deep_merge = <T>(
  target: T,
  source: DeepPartial<T>
): {
  new_obj: T;
  change: boolean;
} => {
  let change = false;
  const new_obj = { ...target };
  for (const key in source) {
    // @ts-ignore: Type 'string' cannot be used to index type 'T
    if (typeof source[key] === "object" && target[key]) {
      const { new_obj: new_obj2, change: change2 } = deep_merge(
        // @ts-ignore: Type 'string' cannot be used to index type 'T
        target[key],
        source[key]
      );
      if (change2) {
        change = true;
        // @ts-ignore: Type 'string' cannot be used to index type 'T
        new_obj[key] = new_obj2;
      }
    } else {
      // @ts-ignore: Type 'string' cannot be used to index type 'T'
      if (target[key] !== source[key]) {
        change = true;
      }
      // @ts-ignore: Type 'string' cannot be used to index type 'T'
      new_obj[key] = source[key];
    }
  }
  return { new_obj, change };
};
export { deep_merge };
export type { DeepPartial };
