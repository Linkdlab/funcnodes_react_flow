import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DeepPartial,
  LimitedDeepPartial,
  isPlainObject,
  deep_compare_objects,
  deep_merge,
  deep_update,
  printDiff,
  object_factory_maker,
} from "./object-helpers";

describe("object-helpers", () => {
  describe("isPlainObject", () => {
    it("should return true for plain objects", () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject({ a: 1, b: { c: 2 } })).toBe(true);
      expect(isPlainObject(new Object())).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it("should return false for non-plain objects", () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject([1, 2, 3])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new RegExp("test"))).toBe(false);
      expect(isPlainObject(() => {})).toBe(false);
      expect(isPlainObject(function () {})).toBe(false);
    });

    it("should return false for primitive values", () => {
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
      expect(isPlainObject("")).toBe(false);
      expect(isPlainObject("string")).toBe(false);
      expect(isPlainObject(0)).toBe(false);
      expect(isPlainObject(42)).toBe(false);
      expect(isPlainObject(true)).toBe(false);
      expect(isPlainObject(false)).toBe(false);
      expect(isPlainObject(Symbol("test"))).toBe(false);
    });

    it("should return false for class instances", () => {
      class TestClass {}
      expect(isPlainObject(new TestClass())).toBe(false);
    });
  });

  describe("deep_compare_objects", () => {
    describe("primitive values", () => {
      it("should compare primitive values correctly", () => {
        expect(deep_compare_objects(1, 1)).toBe(true);
        expect(deep_compare_objects("a", "a")).toBe(true);
        expect(deep_compare_objects(true, true)).toBe(true);
        expect(deep_compare_objects(null, null)).toBe(true);
        expect(deep_compare_objects(undefined, undefined)).toBe(true);

        expect(deep_compare_objects(1, 2)).toBe(false);
        expect(deep_compare_objects("a", "b")).toBe(false);
        expect(deep_compare_objects(true, false)).toBe(false);
        expect(deep_compare_objects(null, undefined)).toBe(false);
        expect(deep_compare_objects(1, "1")).toBe(false);
      });
    });

    describe("objects", () => {
      it("should compare simple objects correctly", () => {
        expect(deep_compare_objects({ a: 1 }, { a: 1 })).toBe(true);
        expect(deep_compare_objects({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(deep_compare_objects({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);

        expect(deep_compare_objects({ a: 1 }, { a: 2 })).toBe(false);
        expect(deep_compare_objects({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        expect(deep_compare_objects({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      });

      it("should compare nested objects correctly", () => {
        const obj1 = { a: { b: { c: 1 } } };
        const obj2 = { a: { b: { c: 1 } } };
        const obj3 = { a: { b: { c: 2 } } };

        expect(deep_compare_objects(obj1, obj2)).toBe(true);
        expect(deep_compare_objects(obj1, obj3)).toBe(false);
      });

      it("should handle empty objects", () => {
        expect(deep_compare_objects({}, {})).toBe(true);
        expect(deep_compare_objects({}, { a: 1 })).toBe(false);
      });
    });

    describe("arrays", () => {
      it("should compare arrays correctly", () => {
        expect(deep_compare_objects([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(deep_compare_objects([], [])).toBe(true);
        expect(deep_compare_objects([{ a: 1 }], [{ a: 1 }])).toBe(true);

        expect(deep_compare_objects([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(deep_compare_objects([1, 2], [1, 2, 3])).toBe(false);
        expect(deep_compare_objects([{ a: 1 }], [{ a: 2 }])).toBe(false);
      });

      it("should compare nested arrays correctly", () => {
        expect(
          deep_compare_objects(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 4],
            ]
          )
        ).toBe(true);
        expect(
          deep_compare_objects(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 5],
            ]
          )
        ).toBe(false);
      });
    });

    describe("dates", () => {
      it("should compare dates correctly", () => {
        const date1 = new Date("2023-01-01");
        const date2 = new Date("2023-01-01");
        const date3 = new Date("2023-01-02");

        expect(deep_compare_objects(date1, date2)).toBe(true);
        expect(deep_compare_objects(date1, date3)).toBe(false);
      });

      it("should handle invalid dates", () => {
        const invalidDate1 = new Date("invalid");
        const invalidDate2 = new Date("invalid");
        const validDate = new Date("2023-01-01");

        expect(deep_compare_objects(invalidDate1, invalidDate2)).toBe(false); // NaN !== NaN in JavaScript
        expect(deep_compare_objects(invalidDate1, validDate)).toBe(false);
      });
    });

    describe("mixed types", () => {
      it("should return false for different types", () => {
        expect(deep_compare_objects({}, [])).toBe(false);
        expect(deep_compare_objects("1", 1)).toBe(false);
        expect(deep_compare_objects(null, {})).toBe(false);
        expect(deep_compare_objects(undefined, null)).toBe(false);
        expect(deep_compare_objects(new Date(), {})).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should handle circular references safely", () => {
        const obj1: any = { a: 1 };
        obj1.self = obj1;

        const obj2: any = { a: 1 };
        obj2.self = obj2;

        // Should handle circular references without throwing
        expect(deep_compare_objects(obj1, obj2)).toBe(true);

        // Should also detect differences in circular structures
        const obj3: any = { a: 2 };
        obj3.self = obj3;
        expect(deep_compare_objects(obj1, obj3)).toBe(false);
      });

      it("should handle circular references at different positions", () => {
        // Test circular references at different nested positions
        const obj1: any = {
          level1: {
            data: "same",
            nested: {},
          },
          shared: "value",
        };
        obj1.level1.nested.circular = obj1; // Circular ref deep in level1

        const obj2: any = {
          level1: {
            data: "same",
            nested: {},
          },
          shared: "value",
        };
        obj2.level1.nested.circular = obj2; // Same structure, same position

        // Should recognize these as equal despite circular refs
        expect(deep_compare_objects(obj1, obj2)).toBe(true);

        // Test different positions for circular references
        const obj3: any = {
          level1: {
            data: "same",
            nested: {},
          },
          shared: "value",
        };
        obj3.shared = obj3; // Circular ref at different position

        // Should detect these as different (circular ref at different locations)
        expect(deep_compare_objects(obj1, obj3)).toBe(false);

        // Test mixed circular and non-circular
        const obj4: any = {
          level1: {
            data: "different", // Different value
            nested: {},
          },
          shared: "value",
        };
        obj4.level1.nested.circular = obj4;

        // Should detect difference in data despite same circular structure
        expect(deep_compare_objects(obj1, obj4)).toBe(false);
      });

      it("should handle null and undefined correctly", () => {
        expect(deep_compare_objects(null, null)).toBe(true);
        expect(deep_compare_objects(undefined, undefined)).toBe(true);
        expect(deep_compare_objects(null, undefined)).toBe(false);
        expect(deep_compare_objects({ a: null }, { a: null })).toBe(true);
        expect(deep_compare_objects({ a: null }, { a: undefined })).toBe(false);
      });
    });
  });

  describe("deep_merge", () => {
    it("should merge simple objects correctly", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual({ a: 1, b: 3, c: 4 });
      expect(result.change).toBe(true);
    });

    it("should merge nested objects correctly", () => {
      const target = {
        user: { name: "John", age: 30 },
        settings: { theme: "light", lang: "en" },
      };
      const source = {
        user: { age: 31 },
        settings: { theme: "dark" },
      };
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual({
        user: { name: "John", age: 31 },
        settings: { theme: "dark", lang: "en" },
      });
      expect(result.change).toBe(true);
    });

    it("should return false for change when no changes occur", () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { a: 1, b: { c: 2 } };
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual(target);
      expect(result.change).toBe(false);
    });

    it("should not modify the original target object", () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { c: 3 } };
      const originalTarget = JSON.parse(JSON.stringify(target));

      deep_merge(target, source);

      expect(target).toEqual(originalTarget);
    });

    it("should handle empty objects", () => {
      const target = { a: 1 };
      const source = {};
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual({ a: 1 });
      expect(result.change).toBe(false);
    });

    it("should replace non-object values entirely", () => {
      const target = { a: 1, b: "string" };
      const source = { a: { nested: true }, b: "newstring" } as any;
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual({ a: { nested: true }, b: "newstring" });
      expect(result.change).toBe(true);
    });

    it("should throw error for non-plain objects", () => {
      expect(() => deep_merge([] as any, { a: 1 } as any)).toThrow(
        "Target must be a plain object"
      );
      expect(() => deep_merge({ a: 1 }, [] as any)).toThrow(
        "Source must be a plain object"
      );
      expect(() => deep_merge(null as any, { a: 1 })).toThrow(
        "Target must be a plain object"
      );
    });

    it("should handle complex nested structures", () => {
      const target = {
        level1: {
          level2: {
            level3: {
              value: "old",
              keep: "unchanged",
            },
          },
        },
      };
      const source = {
        level1: {
          level2: {
            level3: {
              value: "new",
            },
          },
        },
      };
      const result = deep_merge(target, source);

      expect(result.new_obj).toEqual({
        level1: {
          level2: {
            level3: {
              value: "new",
              keep: "unchanged",
            },
          },
        },
      });
      expect(result.change).toBe(true);
    });
  });

  describe("deep_update", () => {
    it("should add missing properties", () => {
      const target = { a: 1 };
      const source = { a: 1, b: 2, c: 3 };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({ a: 1, b: 2, c: 3 });
      expect(result.change).toBe(true);
    });

    it("should not overwrite existing properties", () => {
      const target = { a: 1, b: 2 };
      const source = { a: 10, b: 20, c: 3 };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({ a: 1, b: 2, c: 3 });
      expect(result.change).toBe(true);
    });

    it("should handle nested objects correctly", () => {
      const target = {
        user: { name: "John" },
        settings: { theme: "dark" },
      };
      const source = {
        user: { name: "Default", age: 0, email: "none@example.com" },
        settings: { theme: "light", lang: "en", notifications: true },
      };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({
        user: { name: "John", age: 0, email: "none@example.com" },
        settings: { theme: "dark", lang: "en", notifications: true },
      });
      expect(result.change).toBe(true);
    });

    it("should return false for change when no updates needed", () => {
      const target = { a: 1, b: { c: 2, d: 3 } };
      const source = { a: 10, b: { c: 20, d: 30 } };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual(target);
      expect(result.change).toBe(false);
    });

    it("should not modify the original target object", () => {
      const target = { a: 1 };
      const source = { a: 1, b: 2 };
      const originalTarget = JSON.parse(JSON.stringify(target));

      deep_update(target, source);

      expect(target).toEqual(originalTarget);
    });

    it("should handle undefined values correctly", () => {
      const target = { a: 1, b: undefined };
      const source = { a: 10, b: 2, c: 3 };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({ a: 1, b: 2, c: 3 });
      expect(result.change).toBe(true);
    });

    it("should not update when target has non-object but source has object", () => {
      const target = { a: "string" } as any;
      const source = { a: { nested: true } };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({ a: "string" });
      expect(result.change).toBe(false);
    });

    it("should throw error for non-plain objects", () => {
      expect(() => deep_update([] as any, { a: 1 })).toThrow(
        "Target must be a plain object"
      );
      expect(() => deep_update({ a: 1 }, [] as any)).toThrow(
        "Source must be a plain object"
      );
    });

    it("should handle deeply nested missing properties", () => {
      const target = {
        level1: {
          level2: {
            existing: "value",
          },
        },
      };
      const source = {
        level1: {
          level2: {
            existing: "default",
            missing: "added",
          },
          level2b: {
            new: "property",
          },
        },
      };
      const result = deep_update(target, source);

      expect(result.new_obj).toEqual({
        level1: {
          level2: {
            existing: "value",
            missing: "added",
          },
          level2b: {
            new: "property",
          },
        },
      });
      expect(result.change).toBe(true);
    });
  });

  describe("printDiff", () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should print differences between objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 3 };

      printDiff(obj1, obj2);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Key 'b' exists only in the first object."
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key 'c' exists only in the second object."
      );
    });

    it("should print value differences", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 2, b: 2 };

      printDiff(obj1, obj2);

      expect(consoleSpy).toHaveBeenCalledWith("Difference at 'a': 1 vs 2");
    });

    it("should handle nested objects", () => {
      const obj1 = { user: { name: "John", age: 30 } };
      const obj2 = { user: { name: "Jane", age: 30 } };

      printDiff(obj1, obj2);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Difference at 'user.name': John vs Jane"
      );
    });

    it("should handle complex nested differences", () => {
      const obj1 = {
        user: { name: "John" },
        settings: { theme: "light" },
      };
      const obj2 = {
        user: { name: "John", age: 30 },
        settings: { theme: "light", lang: "en" },
      };

      printDiff(obj1, obj2);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Key 'user.age' exists only in the second object."
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key 'settings.lang' exists only in the second object."
      );
    });

    it("should not print anything for identical objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };

      printDiff(obj1, obj2);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("object_factory_maker", () => {
    it("should create factory that returns default object when no params", () => {
      const defaultObj = { theme: "light", lang: "en" };
      const factory = object_factory_maker(defaultObj);

      const result = factory();

      expect(result).toEqual(defaultObj);
      expect(result).not.toBe(defaultObj); // Should be a new object
    });

    it("should create factory that merges partial objects", () => {
      const defaultObj = {
        theme: "light",
        lang: "en",
        features: { darkMode: false, notifications: true },
      };
      const factory = object_factory_maker(defaultObj);

      const result = factory({ theme: "dark", features: { darkMode: true } });

      expect(result).toEqual({
        theme: "dark",
        lang: "en",
        features: { darkMode: true, notifications: true },
      });
    });

    it("should apply factory updates when provided", () => {
      const defaultObj = { name: "default", value: 0 };
      const factory = object_factory_maker(defaultObj, (obj) => ({
        ...obj,
        timestamp: 123456789,
        value: obj.value + 10,
      }));

      const result = factory();

      expect(result).toEqual({
        name: "default",
        value: 10,
        timestamp: 123456789,
      });
    });

    it("should apply factory updates before merging partial object", () => {
      const defaultObj = { a: 1, b: 2 };
      const factory = object_factory_maker(defaultObj, (obj) => ({
        ...obj,
        c: 3,
      }));

      const result = factory({ b: 20 });

      expect(result).toEqual({ a: 1, b: 20, c: 3 });
    });

    it("should handle complex nested structures", () => {
      const defaultObj = {
        user: { name: "Anonymous", preferences: { theme: "light" } },
        app: { version: "1.0.0" },
      };
      const factory = object_factory_maker(defaultObj);

      const result = factory({
        user: { name: "John", preferences: { theme: "dark" } },
      });

      expect(result).toEqual({
        user: { name: "John", preferences: { theme: "dark" } },
        app: { version: "1.0.0" },
      });
    });

    it("should create independent instances", () => {
      const defaultObj = { items: [] };
      const factory = object_factory_maker(defaultObj);

      const obj1 = factory();
      const obj2 = factory();

      (obj1.items as any[]).push("item1");

      expect(obj1.items).toEqual(["item1"]);
      expect(obj2.items).toEqual([]);
    });

    it("should work with factory updates that modify structure", () => {
      const defaultObj = { base: true };
      const factory = object_factory_maker(defaultObj, (obj) => ({
        ...obj,
        enhanced: true,
        computed: Date.now(),
      }));

      const result1 = factory({ base: false }) as any;
      const result2 = factory() as any;

      expect(result1.base).toBe(false);
      expect(result1.enhanced).toBe(true);
      expect(result1.computed).toBeTypeOf("number");

      expect(result2.base).toBe(true);
      expect(result2.enhanced).toBe(true);
      expect(result2.computed).toBeTypeOf("number");
    });

    it("should handle edge cases with undefined and null", () => {
      const defaultObj = { a: null, b: undefined, c: "value" };
      const factory = object_factory_maker(defaultObj);

      const result = factory({ a: "new", d: "added" } as any);

      expect(result).toEqual({
        a: "new",
        b: undefined,
        c: "value",
        d: "added",
      });
    });
  });

  describe("Type Tests", () => {
    describe("DeepPartial", () => {
      it("should work with nested interfaces", () => {
        interface Config {
          user: {
            name: string;
            age: number;
            settings: {
              theme: string;
              lang: string;
            };
          };
          app: {
            version: string;
          };
        }

        // These should compile without errors
        const partial1: DeepPartial<Config> = {};
        const partial2: DeepPartial<Config> = {
          user: {
            name: "John",
          },
        };
        const partial3: DeepPartial<Config> = {
          user: {
            settings: {
              theme: "dark",
            },
          },
        };

        // Type assertions to verify the types work
        expect(partial1).toBeDefined();
        expect(partial2).toBeDefined();
        expect(partial3).toBeDefined();
      });
    });

    describe("LimitedDeepPartial", () => {
      it("should work with depth limits", () => {
        interface DeepConfig {
          level1: {
            level2: {
              level3: {
                value: string;
              };
            };
          };
        }

        // These should compile without errors
        const shallow: LimitedDeepPartial<DeepConfig, 2> = {
          level1: {
            level2: {} as any, // At depth limit, should accept any
          },
        };

        const deep: LimitedDeepPartial<DeepConfig, 5> = {
          level1: {
            level2: {
              level3: {
                value: "test",
              },
            },
          },
        };

        expect(shallow).toBeDefined();
        expect(deep).toBeDefined();
      });
    });
  });
});
