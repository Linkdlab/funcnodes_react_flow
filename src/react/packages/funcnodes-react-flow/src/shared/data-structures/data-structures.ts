/**
 * Union type representing all supported data types for DataStructure instances.
 * Includes primitive types and binary data.
 */
export interface JSONObject {
  [key: string]: JSONType;
}
export type JSONType =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONType[];

export type AnyDataType = JSONType | ArrayBuffer | Blob;
/**
 * Properties for constructing a DataStructure instance.
 *
 * @template D - The type of data being wrapped, must extend AnyDataType
 */
export type DataStructureProps<D extends AnyDataType> = {
  /** The actual data to be wrapped */
  data: D;
  /** MIME type string describing the data format */
  mime: string;
};

export type BinarySource = ArrayBufferLike | ArrayBufferView;

/**
 * Base class for wrapping data with MIME type information.
 * Provides a consistent interface for accessing typed data with metadata.
 *
 * @template D - The type of the wrapped data, must extend AnyDataType
 * @template R - The return type when accessing the value property, must extend JSONType or be undefined
 *
 * @example
 * ```typescript
 * const textData = new DataStructure({
 *   data: "Hello World",
 *   mime: "text/plain"
 * });
 * console.log(textData.data); // "Hello World"
 * console.log(textData.mime); // "text/plain"
 * ```
 */
export class DataStructure<
  D extends AnyDataType,
  R extends JSONType | undefined
> {
  /** The wrapped data */
  private _data: D;
  /** MIME type describing the data format */
  private _mime: string;

  /**
   * Creates a new DataStructure instance.
   *
   * @param props - Configuration object containing data and MIME type
   */
  constructor({ data, mime }: DataStructureProps<D>) {
    this._data = data;
    this._mime = mime;
  }

  /**
   * Gets the raw wrapped data.
   *
   * @returns The original data in its native type
   */
  get data(): D {
    return this._data;
  }

  /**
   * Gets the data cast to the expected return type.
   * This is a type assertion and should be overridden in subclasses for proper type conversion.
   *
   * @returns The data cast to type R
   */
  get value(): R {
    return this._data as unknown as R;
  }

  /**
   * Gets the MIME type of the wrapped data.
   *
   * @returns The MIME type string
   */
  get mime(): string {
    return this._mime;
  }

  /**
   * Returns a string representation of the DataStructure.
   * The format varies based on the data type:
   * - ArrayBuffer: shows byte length
   * - Blob: shows size
   * - String/Array: shows length
   * - Object: shows number of keys
   * - Other types: shows only MIME type
   *
   * @returns String representation in format "DataStructure(size,mime)" or "DataStructure(mime)"
   */
  toString(): string {
    if (this._data instanceof ArrayBuffer) {
      return `DataStructure(${this._data.byteLength},${this._mime})`;
    }
    if (this._data instanceof Blob) {
      return `DataStructure(${this._data.size},${this._mime})`;
    }
    if (this._data instanceof String) {
      return `DataStructure(${this._data.length},${this._mime})`;
    }
    if (this._data instanceof Array) {
      return `DataStructure(${this._data.length},${this._mime})`;
    }
    if (this._data instanceof Object) {
      return `DataStructure(${Object.keys(this._data).length},${this._mime})`;
    }
    return `DataStructure(${this._mime})`;
  }

  /**
   * Returns the JSON representation of this DataStructure.
   * Currently delegates to toString() method.
   *
   * @returns JSON string representation
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Cleans up resources associated with this DataStructure.
   * Base implementation does nothing, but subclasses may override to release resources.
   */
  dispose() {}
}

export class ArrayBufferDataStructure extends DataStructure<
  ArrayBuffer,
  string
> {
  private _objectUrl: string | undefined;

  constructor({ data, mime }: { data: BinarySource; mime: string }) {
    super({ data: to_arraybuffer(data), mime });
  }

  get objectUrl(): string {
    if (this._objectUrl) {
      return this._objectUrl;
    }
    const blob =
      this.data instanceof Blob
        ? this.data
        : new Blob([this.data], { type: this.mime });
    this._objectUrl = URL.createObjectURL(blob);
    return this._objectUrl;
  }

  dispose() {
    if (this._objectUrl) {
      URL.revokeObjectURL(this._objectUrl);
    }
    super.dispose();
  }

  get value() {
    return this.objectUrl;
  }
}

const to_arraybuffer = (data: BinarySource): ArrayBuffer => {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  const view = ArrayBuffer.isView(data)
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : new Uint8Array(data);

  const copy = new ArrayBuffer(view.byteLength);
  new Uint8Array(copy).set(view);
  return copy;
};

const ctypeunpacker: {
  [key: string]: (
    data: ArrayBuffer,
    littleEndian: boolean
  ) => string | number | boolean | null;
} = {
  x: (_data: ArrayBuffer, _littleEndian: boolean) => {
    return null;
  }, //  pad byte 	no value 	(7 )
  c: (data: ArrayBuffer, _littleEndian: boolean) => {
    return new DataView(data).getInt8(0);
  }, //  char 	bytes of length 1 	1 	b 	signed char 	integer 	1 	(1 ), (2 )
  B: (data: ArrayBuffer, _littleEndian: boolean) => {
    return new DataView(data).getUint8(0);
  }, //  unsigned char 	integer 	1 	(2 )
  "?": (data: ArrayBuffer, _littleEndian: boolean) => {
    return new DataView(data).getInt8(0) === 1;
  }, //  _Bool 	bool 	1 	(1 )
  h: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getInt16(0, littleEndian);
  }, //  short 	integer 	2 	(2 )
  H: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getUint16(0, littleEndian);
  }, //  unsigned short 	integer 	2 	(2 )
  i: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getInt32(0, littleEndian);
  }, //  int 	integer 	4 	(2 )
  I: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getUint32(0, littleEndian);
  }, //  unsigned int 	integer 	4 	(2 )
  l: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getInt32(0, littleEndian);
  }, //  long 	integer 	4 	(2 )
  L: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getUint32(0, littleEndian);
  }, //  unsigned long 	integer 	4 	(2 )
  q: (data: ArrayBuffer, littleEndian: boolean) => {
    return Number(
      new DataView(data).getBigInt64(0, littleEndian)
    );
  }, //  long long 	integer 	8 	(2 )
  Q: (data: ArrayBuffer, littleEndian: boolean) => {
    return Number(
      new DataView(data).getBigUint64(0, littleEndian)
    );
  }, //  unsigned long long 	integer 	8 	(2 )
  n: (data: ArrayBuffer, littleEndian: boolean) => {
    return Number(
      new DataView(data).getBigInt64(0, littleEndian)
    );
  }, //  ssize_t 	integer 	(3 )
  N: (data: ArrayBuffer, littleEndian: boolean) => {
    return Number(
      new DataView(data).getBigUint64(0, littleEndian)
    );
  }, //  size_t 	integer 	(3 )
  // "e":(data:ArrayBufferLike)=>{return new DataView(to_arraybuffer(data)).getFloat16(0)}, //  (6 ) float 	2 	(4 )
  f: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getFloat32(0, littleEndian);
  }, //  float 	float 	4 	(4 )
  d: (data: ArrayBuffer, littleEndian: boolean) => {
    return new DataView(data).getFloat64(0, littleEndian);
  }, //  double 	float 	8 	(4 )
  s: (data: ArrayBuffer, _littleEndian: boolean) => {
    return new TextDecoder().decode(data);
  }, //  char[] 	bytes 	(9 )
  p: (data: ArrayBuffer, _littleEndian: boolean) => {
    return new TextDecoder().decode(data);
  }, //  char[] 	bytes 	(8 )
  P: (data: ArrayBuffer, littleEndian: boolean) => {
    return Number(
      new DataView(data).getBigUint64(0, littleEndian)
    );
  }, //  void* 	int
};
export class CTypeStructure extends DataStructure<
  ArrayBuffer,
  string | number | boolean | null
> {
  private _cType: string;
  private _value: string | number | boolean | null;

  constructor({ data, mime }: { data: BinarySource; mime: string }) {
    super({ data: to_arraybuffer(data), mime });
    this._cType = mime.split("application/fn.struct.")[1];
    this._value = null;
    this.parse_value();
  }

  parse_value() {
    let littleEndian = true;
    let cType = this._cType;
    if (cType.startsWith("<")) {
      littleEndian = true;
      cType = cType.slice(1);
    }
    if (cType.startsWith(">")) {
      littleEndian = false;
      cType = cType.slice(1);
    }
    if (cType.startsWith("!")) {
      littleEndian = false;
      cType = cType.slice(1);
    }
    if (cType.startsWith("@")) {
      littleEndian = false;
      cType = cType.slice(1);
    }
    if (cType.startsWith("=")) {
      littleEndian = false;
      cType = cType.slice(1);
    }
    this._value = ctypeunpacker[cType](this.data, littleEndian);
    return this._value;
  }

  get value() {
    return this._value;
  }

  toString(): string {
    if (this._value === null) {
      return "null";
    }
    return this._value.toString();
  }
}

export class JSONStructure extends DataStructure<
  ArrayBuffer,
  JSONType | undefined
> {
  private _json: JSONType | undefined;
  constructor({ data, mime }: { data: BinarySource; mime: string }) {
    const buffer = to_arraybuffer(data);
    super({ data: buffer, mime });
    if (buffer.byteLength === 0) {
      this._json = undefined;
    } else {
      this._json = JSON.parse(new TextDecoder().decode(buffer));
      if (this._json === "<NoValue>") {
        this._json = undefined;
      }
    }
  }

  get value() {
    return this._json;
  }

  static fromObject(obj: JSONType) {
    const data =
      obj === "<NoValue>"
        ? new Uint8Array(0)
        : new TextEncoder().encode(JSON.stringify(obj));
    return new JSONStructure({ data, mime: "application/json" });
  }

  toString() {
    // if this._json is string, return it
    if (typeof this._json === "string") {
      return this._json;
    }
    return JSON.stringify(this._json);
  }
}

export class TextStructure extends DataStructure<ArrayBuffer, string> {
  private _value: string;
  constructor({ data, mime }: { data: BinarySource; mime: string }) {
    const buffer = to_arraybuffer(data);
    super({ data: buffer, mime });
    this._value = new TextDecoder().decode(buffer);
  }

  get value() {
    return this._value;
  }

  toString() {
    return this._value;
  }
}

export const interfereDataStructure = ({
  data,
  mime,
}: {
  data: any;
  mime: string;
}) => {
  const isSharedArrayBuffer =
    typeof SharedArrayBuffer !== "undefined" && data instanceof SharedArrayBuffer;

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data) || isSharedArrayBuffer) {
    if (mime.startsWith("application/fn.struct.")) {
      return new CTypeStructure({ data, mime });
    }
    if (mime.startsWith("application/json")) {
      return new JSONStructure({ data, mime });
    }
    if (mime === "text" || mime.startsWith("text/")) {
      return new TextStructure({ data, mime });
    }

    return new ArrayBufferDataStructure({ data, mime });
  }
  return new DataStructure({ data, mime });
};
