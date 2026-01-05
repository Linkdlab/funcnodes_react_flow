import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DataStructure,
  ArrayBufferDataStructure,
  CTypeStructure,
  JSONStructure,
  TextStructure,
  interfereDataStructure,
  AnyDataType,
} from "./data-structures";

const makeBuffer = (setter: (view: DataView) => void) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  setter(view);
  return buffer;
};

describe("DataStructure", () => {
  it("formats string, array, object and buffer data", () => {
    const stringStruct = new DataStructure({
      data: new String("hello") as unknown as AnyDataType,
      mime: "text/plain",
    });
    const arrayStruct = new DataStructure({ data: [1, 2, 3], mime: "array" });
    const objectStruct = new DataStructure({
      data: { a: 1, b: 2 },
      mime: "application/json",
    });
    const bufferStruct = new DataStructure({
      data: new ArrayBuffer(4),
      mime: "application/octet-stream",
    });

    expect(stringStruct.toString()).toContain("DataStructure(5");
    expect(arrayStruct.toString()).toContain("DataStructure(3");
    expect(objectStruct.toString()).toContain("DataStructure(2");
    expect(bufferStruct.toString()).toContain("DataStructure(4");
    expect(bufferStruct.toJSON()).toBe(bufferStruct.toString());
  });
});

describe("ArrayBufferDataStructure", () => {
  beforeEach(() => {
    if (!URL.createObjectURL) {
      URL.createObjectURL = (_data: Blob | MediaSource) => "blob:test";
      URL.revokeObjectURL = (_url: string) => undefined;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates and revokes object URLs", () => {
    const createSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    const struct = new ArrayBufferDataStructure({
      data: new Uint8Array([1, 2, 3]),
      mime: "application/octet-stream",
    });

    expect(struct.value).toBe("blob:test");
    struct.dispose();

    expect(createSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith("blob:test");
  });
});

describe("CTypeStructure", () => {
  it("parses little and big endian values", () => {
    const little = makeBuffer((view) => view.setInt16(0, 256, true));
    const big = makeBuffer((view) => view.setInt16(0, 256, false));

    const littleStruct = new CTypeStructure({
      data: little,
      mime: "application/fn.struct.<h",
    });
    const bigStruct = new CTypeStructure({
      data: big,
      mime: "application/fn.struct.>h",
    });

    expect(littleStruct.value).toBe(256);
    expect(bigStruct.value).toBe(256);
  });

  it("parses boolean and string types", () => {
    const boolBuffer = makeBuffer((view) => view.setInt8(0, 1));
    const textBuffer = new TextEncoder().encode("hello");

    const boolStruct = new CTypeStructure({
      data: boolBuffer,
      mime: "application/fn.struct.?",
    });
    const textStruct = new CTypeStructure({
      data: textBuffer,
      mime: "application/fn.struct.s",
    });

    expect(boolStruct.value).toBe(true);
    expect(textStruct.value).toBe("hello");
  });

  it("parses values from subarray views", () => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint16(2, 0x1234, true);

    const subarray = new Uint8Array(buffer, 2, 2);
    const struct = new CTypeStructure({
      data: subarray,
      mime: "application/fn.struct.<H",
    });

    expect(struct.value).toBe(0x1234);
  });
});

describe("JSONStructure", () => {
  it("handles empty and <NoValue> payloads", () => {
    const empty = new JSONStructure({
      data: new Uint8Array(0),
      mime: "application/json",
    });
    const noValue = new JSONStructure({
      data: new TextEncoder().encode("\"<NoValue>\""),
      mime: "application/json",
    });

    expect(empty.value).toBeUndefined();
    expect(noValue.value).toBeUndefined();
  });

  it("creates from objects and returns string output", () => {
    const struct = JSONStructure.fromObject({ hello: "world" });
    expect(struct.value).toEqual({ hello: "world" });
    expect(struct.toString()).toBe("{\"hello\":\"world\"}");

    const stringStruct = JSONStructure.fromObject("plain");
    expect(stringStruct.toString()).toBe("plain");
  });
});

describe("TextStructure", () => {
  it("decodes text buffers", () => {
    const struct = new TextStructure({
      data: new TextEncoder().encode("hello"),
      mime: "text/plain",
    });

    expect(struct.value).toBe("hello");
    expect(struct.toString()).toBe("hello");
  });
});

describe("interfereDataStructure", () => {
  it("returns appropriate structure types", () => {
    if (!URL.createObjectURL) {
      URL.createObjectURL = (_data: Blob | MediaSource) => "blob:test";
      URL.revokeObjectURL = (_url: string) => undefined;
    }

    const jsonBuffer = new window.Uint8Array([52]).buffer;
    const textBuffer = new window.Uint8Array([52]).buffer;
    const ctypeBuffer = new window.ArrayBuffer(4);
    new window.DataView(ctypeBuffer).setInt32(0, 42, true);
    const binaryBuffer = new window.Uint8Array([1, 2, 3]).buffer;

    const jsonResult = interfereDataStructure({
      data: jsonBuffer,
      mime: "application/json",
    });
    expect(jsonResult.value).toBe(4);

    const textResult = interfereDataStructure({
      data: textBuffer,
      mime: "text/plain",
    });
    expect(textResult.value).toBe("4");

    const ctypeResult = interfereDataStructure({
      data: ctypeBuffer,
      mime: "application/fn.struct.i",
    });
    expect(ctypeResult.value).toBe(42);

    const binaryResult = interfereDataStructure({
      data: binaryBuffer,
      mime: "application/octet-stream",
    });
    expect(typeof binaryResult.value).toBe("string");
    expect(binaryResult.mime).toBe("application/octet-stream");

    const fallback = interfereDataStructure({
      data: { ok: true },
      mime: "application/json",
    });
    expect(fallback.value).toEqual({ ok: true });
  });
});
