// Type alias for DeepPartial. It makes all properties of T optional and recursive.
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Checks if the given item is a plain object.
 * @param item The item to check.
 * @returns true if the item is a plain object, false otherwise.
 */
function isPlainObject(item: any): boolean {
  return Object.prototype.toString.call(item) === "[object Object]";
}

function deep_compare_objects(a: any, b: any): boolean {
  // Check for strict equality first
  if (a === b) return true;

  // If either is null or not an object, they're not equal (strict equality would have caught `a === b` if both were null)
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  )
    return false;

  // If they're not the same type of object, they're not equal
  if (a.constructor !== b.constructor) return false;

  if (a.constructor === Object || a.constructor === Array) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // If their property lengths are different, they're different objects
    if (keysA.length !== keysB.length) return false;

    // Check each key in 'a' to ensure it exists in 'b' and is equal; recurse if value is an object
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deep_compare_objects(a[key], b[key])) return false;
    }
  }

  // Dates comparison
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  // If we've made it this far, objects must be considered equal
  return true;
}

/**
 *
 * function to deeply merge two objects of type T.
 *
 * @param {T} target - The target object to be merged.
 * @param {DeepPartial<T>} source - The source object to merge into the target. All properties of this object are optional.
 *
 * @returns {T} An object containing the merged object (new_obj) and a boolean indicating if there was a change (change).
 */
const deep_merge = <T extends {}>(
  target: T,
  source: DeepPartial<T>
): {
  new_obj: T;
  change: boolean;
} => {
  let change = false;
  if (!isPlainObject(target)) {
    throw new Error("Target must be a plain object");
  }
  if (!isPlainObject(source)) {
    throw new Error("Source must be a plain object");
  }
  const new_obj: T = { ...target };

  Object.keys(source).forEach((key) => {
    // @ts-ignore: Type 'string' cannot be used to index type 'T
    const sourceValue = source[key];
    // @ts-ignore: Type 'string' cannot be used to index type 'T
    const targetValue = target[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      // If both the target and source values are plain objects, merge them
      const { new_obj: mergedObj, change: didChange } = deep_merge(
        targetValue,
        sourceValue
      );
      if (didChange) {
        change = true;

        // @ts-ignore: Type 'string' cannot be used to index type 'T
        new_obj[key] = mergedObj;
      }
    } else if (!deep_compare_objects(targetValue, sourceValue)) {
      change = true;
      // @ts-ignore: Type 'string' cannot be used to index type 'T
      new_obj[key] = sourceValue;
    }
  });

  return { new_obj, change };
};

/**
 * Deeply updates the target object with missing keys from the source object.
 * @param target The target object to be updated.
 * @param source The source object containing keys to add to the target.
 * @returns An object containing the updated target object (new_obj) and a boolean indicating if there was a change (change).
 */
const deep_update = <T extends {}>(
  target: DeepPartial<T>,
  source: T
): {
  new_obj: T;
  change: boolean;
} => {
  let change = false;

  if (!isPlainObject(target)) {
    throw new Error("Target must be a plain object");
  }
  if (!isPlainObject(source)) {
    throw new Error("Source must be a plain object");
  }

  // @ts-ignore new_object is initial not T but DeepPartial<T>
  const new_obj: T = { ...target };

  Object.keys(source).forEach((key) => {
    // @ts-ignore: Type 'string' cannot be used to index type 'T
    const sourceValue = source[key];
    // @ts-ignore: Type 'string' cannot be used to index type 'T
    const targetValue = target[key];

    if (targetValue === undefined && sourceValue === undefined) return;

    if (targetValue === undefined) {
      change = true;
      // @ts-ignore: Type 'string' cannot be used to index type 'T
      new_obj[key] = sourceValue;
      return;
    }

    if (isPlainObject(sourceValue)) {
      if (isPlainObject(targetValue)) {
        // Recursively update nested objects
        const { new_obj: updatedObj, change: didChange } = deep_update(
          targetValue,
          sourceValue
        );
        if (didChange) {
          change = true;
          // @ts-ignore: Type 'string' cannot be used to index type 'T
          new_obj[key] = updatedObj;
        }
      } else {
        // sourceValue is an object but targetValue is not - update does nothing
      }
    } else {
      // sourceValue is not an object but targetValue is not undefined - update does nothing
    }
  });

  return { new_obj, change };
};

export { deep_merge, deep_update, deep_compare_objects };
export type { DeepPartial };