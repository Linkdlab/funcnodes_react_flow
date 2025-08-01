/**
 * A utility type that makes all properties of an object type T optional recursively.
 *
 * This type is similar to TypeScript's built-in `Partial<T>`, but it applies the optional
 * modifier recursively to all nested objects and their properties. This is particularly
 * useful when you want to create partial updates or configurations where any level of
 * nesting can be optionally specified.
 *
 * @template T - The type to make deeply partial. Can be any type, but the transformation
 *              only applies meaningfully to object types.
 *
 * @example
 * ```typescript
 * interface Config {
 *   app: {
 *     name: string;
 *     version: string;
 *     features: {
 *       darkMode: boolean;
 *       notifications: boolean;
 *     };
 *   };
 *   user: {
 *     id: number;
 *     preferences: {
 *       language: string;
 *       theme: string;
 *     };
 *   };
 * }
 *
 * // All properties at all levels become optional
 * type PartialConfig = DeepPartial<Config>;
 *
 * // Valid partial configurations:
 * const config1: PartialConfig = {}; // Empty object
 * const config2: PartialConfig = { app: { name: "MyApp" } }; // Partial app config
 * const config3: PartialConfig = {
 *   user: {
 *     preferences: { language: "en" }
 *   }
 * }; // Deeply nested partial
 * ```
 *
 * @example
 * ```typescript
 * // With primitive types, the type remains unchanged
 * type PartialString = DeepPartial<string>; // string
 * type PartialNumber = DeepPartial<number>; // number
 * type PartialBoolean = DeepPartial<boolean>; // boolean
 *
 * // With arrays, the array itself becomes optional but elements keep their type
 * type PartialArray = DeepPartial<string[]>; // string[] | undefined
 * ```
 *
 * @note This type uses conditional types and mapped types to recursively apply the
 *       optional modifier. For non-object types (primitives, functions, etc.), the
 *       original type is returned unchanged.
 *
 * @note Arrays are treated as objects, so `DeepPartial<T[]>` results in `T[]?` rather
 *       than `(DeepPartial<T>)[]?`. If you need the array elements to also be deeply
 *       partial, consider using a more specialized type.
 *
 * @see LimitedDeepPartial - A depth-limited version of this type to prevent infinite recursion
 * @see deep_merge - Function that works well with DeepPartial types for object merging
 * @see deep_update - Function that accepts DeepPartial-like objects for updating
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * A helper type array used to track and control recursion depth in type operations.
 *
 * This type provides a lookup table for decremental recursion depth values, where each
 * index maps to the previous number in the sequence. This is used by LimitedDeepPartial
 * and other recursive type operations to prevent infinite recursion by counting down
 * from a maximum depth to zero.
 *
 * @example
 * ```typescript
 * // Usage in recursive type (internal to LimitedDeepPartial)
 * type DecrementDepth<D extends number> = Prev[D]; // Prev[5] = 4, Prev[4] = 3, etc.
 * ```
 *
 * @note The array contains values from 'never' at index 0 to 99 at index 100.
 *       Index 0 maps to 'never' which effectively terminates recursion.
 *       Indexes 1-100 map to their predecessor (1→0, 2→1, 3→2, etc.).
 *
 * @see LimitedDeepPartial - Primary consumer of this type for depth-limited recursion
 */
type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99
];

/**
 * A depth-limited version of DeepPartial that prevents infinite recursion by limiting
 * the depth of the optional property transformation.
 *
 * This type is similar to `DeepPartial<T>` but includes a recursion depth limit to prevent
 * TypeScript from hitting infinite recursion errors when dealing with circular type references
 * or very deeply nested object structures. Once the depth limit is reached, the original
 * type T is returned without further transformation.
 *
 * @template T - The type to make deeply partial with depth limitation
 * @template D - The maximum recursion depth (defaults to 10). Must be a number literal type
 *              from the Prev array. When D reaches 0, recursion stops and T is returned as-is.
 *
 * @example
 * ```typescript
 * interface DeepConfig {
 *   level1: {
 *     level2: {
 *       level3: {
 *         value: string;
 *         nested: DeepConfig; // Circular reference
 *       };
 *     };
 *   };
 * }
 *
 * // Safe to use with circular references due to depth limit
 * type PartialConfig = LimitedDeepPartial<DeepConfig, 5>;
 *
 * // Usage examples
 * const config1: PartialConfig = {}; // Valid
 * const config2: PartialConfig = {
 *   level1: {
 *     level2: {
 *       level3: { value: "test" }
 *     }
 *   }
 * }; // Valid - within depth limit
 * ```
 *
 * @example
 * ```typescript
 * // Controlling recursion depth
 * type ShallowPartial = LimitedDeepPartial<MyType, 2>; // Only 2 levels deep
 * type DeepPartial = LimitedDeepPartial<MyType, 15>; // 15 levels deep
 * type DefaultPartial = LimitedDeepPartial<MyType>; // 10 levels deep (default)
 * ```
 *
 * @note The depth parameter D must be a literal number type that exists in the Prev array.
 *       The Prev array defines the available depth values (0-99 in this implementation).
 *
 * @note When the depth limit is reached (D extends 0), the type transformation stops
 *       and the original type T is returned. This means properties at that depth and
 *       beyond will retain their original required/optional status.
 *
 * @note This type is particularly useful when working with recursive data structures,
 *       tree-like objects, or any scenario where DeepPartial might cause TypeScript
 *       compilation issues due to infinite recursion.
 *
 * @see DeepPartial - The unlimited depth version of this type
 * @see Prev - The helper type array that defines available depth values
 * @see deep_update - Function that works with LimitedDeepPartial types
 */
export type LimitedDeepPartial<T, D extends number = 10> = D extends 0
  ? T
  : T extends object
  ? { [K in keyof T]?: LimitedDeepPartial<T[K], Prev[D]> }
  : T;

/**
 * Determines if the given item is a plain JavaScript object (not an array, function, or other object type).
 *
 * A plain object is an object created by the Object constructor or one with a null prototype.
 * This function uses the reliable Object.prototype.toString method to check the object's type,
 * which distinguishes plain objects from arrays, dates, functions, and other object types.
 *
 * @param item - The value to test. Can be any type.
 *
 * @returns `true` if the item is a plain object (created by `{}` or `new Object()`),
 *          `false` for arrays, functions, dates, null, primitives, or other object types.
 *
 * @example
 * ```typescript
 * isPlainObject({});              // true
 * isPlainObject({ a: 1 });        // true
 * isPlainObject(new Object());    // true
 * isPlainObject(Object.create(null)); // true
 *
 * isPlainObject([]);              // false (array)
 * isPlainObject(new Date());      // false (Date object)
 * isPlainObject(() => {});        // false (function)
 * isPlainObject(null);            // false (null)
 * isPlainObject("string");        // false (primitive)
 * isPlainObject(42);              // false (primitive)
 * ```
 *
 * @note This function is used internally by deep_merge and deep_update to ensure
 *       they only process plain objects and handle other types appropriately.
 *
 * @see deep_merge - Uses this function to validate merge targets
 * @see deep_update - Uses this function to validate update targets
 */
export function isPlainObject(item: any): boolean {
  if (Object.prototype.toString.call(item) !== "[object Object]") {
    return false;
  }

  // If object is created by Object constructor or has null prototype
  const prototype = Object.getPrototypeOf(item);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Performs a deep comparison between two values to determine if they are structurally equal.
 *
 * This function recursively compares objects, arrays, and primitive values to determine
 * structural equality. Unlike shallow comparison (===), this function traverses nested
 * objects and arrays to compare their contents. It handles special cases like Date objects
 * and ensures proper comparison of different object types.
 *
 * @param a - The first value to compare. Can be any type.
 * @param b - The second value to compare. Can be any type.
 *
 * @returns `true` if the values are deeply equal, `false` otherwise.
 *
 * @example
 * ```typescript
 * // Primitive values
 * deep_compare_objects(1, 1);           // true
 * deep_compare_objects("a", "a");       // true
 * deep_compare_objects(null, null);     // true
 *
 * // Objects
 * deep_compare_objects({ a: 1 }, { a: 1 });                    // true
 * deep_compare_objects({ a: { b: 2 } }, { a: { b: 2 } });      // true
 * deep_compare_objects({ a: 1 }, { a: 2 });                    // false
 * deep_compare_objects({ a: 1 }, { a: 1, b: 2 });             // false
 *
 * // Arrays
 * deep_compare_objects([1, 2, 3], [1, 2, 3]);                 // true
 * deep_compare_objects([{ a: 1 }], [{ a: 1 }]);               // true
 * deep_compare_objects([1, 2], [1, 2, 3]);                    // false
 *
 * // Dates
 * const date1 = new Date('2023-01-01');
 * const date2 = new Date('2023-01-01');
 * deep_compare_objects(date1, date2);                          // true
 *
 * // Mixed types
 * deep_compare_objects({}, []);                                // false
 * deep_compare_objects("1", 1);                                // false
 * ```
 *
 * @note This function uses strict equality (===) as the first check for performance.
 *       For objects, it compares constructors to ensure type compatibility before
 *       recursively comparing properties.
 *
 * @note Date objects are compared by their time value using getTime().
 *
 * @note Arrays and plain objects are compared by recursively checking all enumerable properties.
 *
 * @see deep_merge - Uses this function to determine if values have changed during merging
 * @see isPlainObject - Used internally to identify plain objects for comparison
 */
export function deep_compare_objects(
  a: any,
  b: any,
  visited = new WeakMap()
): boolean {
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

  // Check for circular references
  if (visited.has(a)) {
    return visited.get(a) === b;
  }
  visited.set(a, b);

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
      if (!deep_compare_objects(a[key], b[key], visited)) return false;
    }
  }

  // Dates comparison
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  // If we've made it this far, objects must be considered equal
  return true;
}

/**
 * Deeply merges two objects, with the source object's properties taking precedence over the target's.
 *
 * This function creates a new object by recursively merging properties from the source object
 * into the target object. Unlike shallow merging, this function traverses nested objects and
 * merges them at each level. The function returns both the merged result and a boolean flag
 * indicating whether any changes were made during the merge process.
 *
 * @template T - The type of the target object and the resulting merged object
 *
 * @param target - The base object that will be merged with the source. Must be a plain object.
 * @param source - The object whose properties will override or extend the target object.
 *                Can be a partial representation of T with any level of nesting optional.
 *
 * @returns An object containing:
 *          - `new_obj`: A new object of type T with merged properties
 *          - `change`: Boolean indicating if any modifications were made during merging
 *
 * @throws {Error} Throws an error if either target or source is not a plain object
 *
 * @example
 * ```typescript
 * const target = {
 *   user: { name: 'John', age: 30 },
 *   settings: { theme: 'light', lang: 'en' }
 * };
 *
 * const source = {
 *   user: { age: 31 },           // Will override age, keep name
 *   settings: { theme: 'dark' }   // Will override theme, keep lang
 * };
 *
 * const result = deep_merge(target, source);
 * // result.new_obj = {
 * //   user: { name: 'John', age: 31 },
 * //   settings: { theme: 'dark', lang: 'en' }
 * // }
 * // result.change = true
 * ```
 *
 * @example
 * ```typescript
 * // No changes scenario
 * const target = { a: 1, b: { c: 2 } };
 * const source = { a: 1, b: { c: 2 } };
 * const result = deep_merge(target, source);
 * // result.new_obj = { a: 1, b: { c: 2 } }
 * // result.change = false
 * ```
 *
 * @note This function creates a new object rather than modifying the target in place.
 * @note The function uses deep_compare_objects to determine if changes actually occurred.
 * @note Nested objects are recursively merged, but arrays and other object types are replaced entirely.
 *
 * @see DeepPartial - Type used for the source parameter
 * @see deep_compare_objects - Used to detect changes during merging
 * @see isPlainObject - Used to validate object types
 * @see deep_update - Alternative function for adding missing properties only
 */
export const deep_merge = <T extends {}>(
  target: T,
  source: DeepPartial<T>
): {
  new_obj: T;
  change: boolean;
} => {
  let change = false;
  if (!isPlainObject(target)) {
    throw new Error("Target must be a plain object not" + typeof target);
  }
  if (!isPlainObject(source)) {
    throw new Error("Source must be a plain object not" + typeof source);
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
 * Deeply updates the target object by adding missing properties from the source object.
 *
 * Unlike deep_merge which overwrites existing properties, deep_update only adds properties
 * that are missing (undefined) in the target object. This is useful for filling in default
 * values or ensuring an object has all required properties without overwriting existing data.
 * The function recursively processes nested objects to add missing properties at any depth.
 *
 * @template T - The type of the complete object structure (source object type)
 *
 * @param target - A partial object that may be missing some properties. Can have any subset
 *                of properties from T, with nested objects also being partial.
 * @param source - A complete object of type T that provides the default/missing values.
 *                This object should contain all the properties that might be missing from target.
 *
 * @returns An object containing:
 *          - `new_obj`: A complete object of type T with all properties filled in
 *          - `change`: Boolean indicating if any properties were added during the update
 *
 * @throws {Error} Throws an error if either target or source is not a plain object
 *
 * @example
 * ```typescript
 * interface Config {
 *   user: { name: string; age: number; email: string };
 *   settings: { theme: string; lang: string; notifications: boolean };
 * }
 *
 * const partialConfig = {
 *   user: { name: 'John' },          // Missing age and email
 *   settings: { theme: 'dark' }       // Missing lang and notifications
 * };
 *
 * const defaultConfig: Config = {
 *   user: { name: 'Anonymous', age: 0, email: 'none@example.com' },
 *   settings: { theme: 'light', lang: 'en', notifications: true }
 * };
 *
 * const result = deep_update(partialConfig, defaultConfig);
 * // result.new_obj = {
 * //   user: { name: 'John', age: 0, email: 'none@example.com' },
 * //   settings: { theme: 'dark', lang: 'en', notifications: true }
 * // }
 * // result.change = true
 * ```
 *
 * @example
 * ```typescript
 * // No changes needed scenario
 * const completeConfig = {
 *   user: { name: 'John', age: 30, email: 'john@example.com' },
 *   settings: { theme: 'dark', lang: 'fr', notifications: false }
 * };
 *
 * const result = deep_update(completeConfig, defaultConfig);
 * // result.new_obj = completeConfig (unchanged)
 * // result.change = false
 * ```
 *
 * @note This function only adds missing properties (undefined values). Existing properties,
 *       even if null or empty, are preserved and not overwritten.
 *
 * @note The function recursively processes nested objects but does not update properties
 *       where the target has a non-object value but the source has an object value.
 *
 * @note This is particularly useful for object factories and default value scenarios.
 *
 * @see LimitedDeepPartial - Type used for the target parameter
 * @see deep_merge - Alternative function that overwrites existing properties
 * @see object_factory_maker - Uses this function for applying partial updates
 * @see isPlainObject - Used to validate object types
 */
export const deep_update = <T extends {}>(
  target: LimitedDeepPartial<T>,
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

/**
 * Prints a detailed comparison of two objects to the console, showing differences and unique properties.
 *
 * This utility function recursively traverses two objects and logs any differences between them
 * to the console. It's useful for debugging, testing, and understanding how objects differ.
 * The function reports three types of differences: properties unique to the first object,
 * properties unique to the second object, and properties with different values.
 *
 * @param obj1 - The first object to compare
 * @param obj2 - The second object to compare
 * @param path - Internal parameter for tracking the current property path during recursion.
 *              Should not be provided when calling this function externally.
 *
 * @returns void - This function doesn't return a value, it prints results to console
 *
 * @example
 * ```typescript
 * const obj1 = {
 *   user: { name: 'John', age: 30 },
 *   settings: { theme: 'light' },
 *   features: ['login', 'dashboard']
 * };
 *
 * const obj2 = {
 *   user: { name: 'Jane', age: 30 },
 *   settings: { theme: 'light', lang: 'en' },
 *   permissions: ['read', 'write']
 * };
 *
 * printDiff(obj1, obj2);
 * // Console output:
 * // Difference at 'user.name': John vs Jane
 * // Key 'settings.lang' exists only in the second object.
 * // Key 'features' exists only in the first object.
 * // Key 'permissions' exists only in the second object.
 * ```
 *
 * @example
 * ```typescript
 * // Nested object comparison
 * const config1 = { db: { host: 'localhost', port: 5432 } };
 * const config2 = { db: { host: 'localhost', port: 3306 } };
 *
 * printDiff(config1, config2);
 * // Console output:
 * // Difference at 'db.port': 5432 vs 3306
 * ```
 *
 * @note This function modifies the console output but does not modify the input objects.
 * @note For nested objects, the path parameter builds a dot-notation string (e.g., 'user.settings.theme').
 * @note Arrays and other object types are compared by reference and recursion when both values are plain objects.
 * @note This function is primarily intended for debugging and development purposes.
 *
 * @see isPlainObject - Used to determine if values should be recursively compared
 * @see deep_compare_objects - Alternative function that returns a boolean result instead of printing
 */
export function printDiff(obj1: any, obj2: any, path = ""): void {
  // Check keys in obj1
  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!(key in obj2)) {
      console.log(`Key '${currentPath}' exists only in the first object.`);
    } else {
      const val1 = obj1[key];
      const val2 = obj2[key];
      if (isPlainObject(val1) && isPlainObject(val2)) {
        // Recurse into nested objects
        printDiff(val1, val2, currentPath);
      } else if (val1 !== val2) {
        console.log(`Difference at '${currentPath}': ${val1} vs ${val2}`);
      }
    }
  }
  // Check keys in obj2 that are missing in obj1
  for (const key in obj2) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!(key in obj1)) {
      console.log(`Key '${currentPath}' exists only in the second object.`);
    }
  }
}

/**
 * Creates a factory function that generates objects based on a default template with optional customizations.
 *
 * This function returns a factory that can create new instances of objects by:
 * 1. Deep cloning the default object (using JSON serialization)
 * 2. Applying optional factory updates to modify the default object
 * 3. Merging any provided partial object with the result using deep_update
 *
 * @template T - The type of the default object and the objects created by the factory
 *
 * @param default_obj - The template object that serves as the base for all created objects.
 *                     This object will be deep cloned using JSON serialization, so it must be JSON-serializable.
 *
 * @param factory_updates - Optional function that receives the cloned default object and returns
 *                         a modified version. This is useful for applying dynamic updates or
 *                         transformations to the default object before merging with user input.
 *                         If undefined, no modifications are applied to the default object.
 *
 * @returns A factory function that accepts a partial object and returns a complete object of type T.
 *          The returned factory function:
 *          - Takes an optional LimitedDeepPartial<T> parameter for customizations
 *          - Returns a complete object of type T
 *          - If no parameter is provided, returns the (possibly updated) default object
 *          - If a parameter is provided, deep merges it with the default using deep_update
 *
 * @example
 * ```typescript
 * // Basic usage
 * const defaultConfig = { theme: 'light', lang: 'en', features: { darkMode: false } };
 * const configFactory = object_factory_maker(defaultConfig);
 *
 * const config1 = configFactory(); // Returns exact copy of defaultConfig
 * const config2 = configFactory({ theme: 'dark' }); // { theme: 'dark', lang: 'en', features: { darkMode: false } }
 * const config3 = configFactory({ features: { darkMode: true } }); // Nested merge
 *
 * // With factory updates
 * const configFactoryWithUpdates = object_factory_maker(
 *   defaultConfig,
 *   (obj) => ({ ...obj, timestamp: Date.now() })
 * );
 * const config4 = configFactoryWithUpdates({ theme: 'dark' }); // Includes timestamp
 * ```
 *
 * @note The default object must be JSON-serializable since deep cloning is performed using
 *       JSON.stringify/JSON.parse. Objects with functions, undefined values, symbols, or
 *       circular references will not work correctly.
 *
 * @see deep_update - Used internally to merge partial objects with the default
 * @see LimitedDeepPartial - Type used for the partial object parameter
 */
export const object_factory_maker = <T extends {}>(
  default_obj: T,
  factory_updates: ((obj: T) => T) | undefined = undefined
): ((obj?: LimitedDeepPartial<T>) => T) => {
  const objectstring = JSON.stringify(default_obj);
  return (obj?: LimitedDeepPartial<T>) => {
    let new_obj: T = JSON.parse(objectstring);
    if (factory_updates !== undefined) {
      new_obj = factory_updates(new_obj);
    }
    if (obj === undefined) {
      return new_obj;
    }
    return deep_update(obj, new_obj).new_obj;
  };
};

export const simple_updater = <
  U extends string | number | boolean,
  T extends U | undefined
>(
  oldvalue: U,
  newvalue: T
): [U, boolean] => {
  return newvalue === undefined
    ? [oldvalue, false]
    : [newvalue, oldvalue !== newvalue];
};

export function assertNever(x: never, y: any): never {
  throw new Error("Unhandled case: " + x + " with: " + JSON.stringify(y));
}

export const deep_updater = <T extends {}>(
  oldvalue: T | undefined,
  newvalue: DeepPartial<T> | undefined
): [T | DeepPartial<T> | undefined, boolean] => {
  if (newvalue === undefined) return [oldvalue, false];
  if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
  const { new_obj, change } = deep_merge<T>(oldvalue, newvalue);
  return [new_obj, change];
};
