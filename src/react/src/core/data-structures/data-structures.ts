export type DataStructureProps<D> = {
  data: D;
  mime: string;
};

export class DataStructure<D, R> {
  private _data: D;
  private _mime: string;

  constructor({ data, mime }: DataStructureProps<D>) {
    this._data = data;
    this._mime = mime;
  }

  get data(): D {
    return this._data;
  }

  get value(): R {
    return this._data as unknown as R;
  }

  get mime(): string {
    return this._mime;
  }

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

  toJSON(): string {
    return this.toString();
  }

  dispose() {}
}

export class ArrayBufferDataStructure extends DataStructure<
  ArrayBuffer,
  string
> {
  private _objectUrl: string | undefined;

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

const to_arraybuffer = (data: ArrayBufferLike): ArrayBuffer => {
  if ((data as any).buffer) {
    return (data as any).buffer;
  }
  return data;
  // if (data instanceof Uint8Array) {
  //   return data.buffer;
  // }
  // if (data instanceof ArrayBuffer) {
  //   return data;
  // }
  // if (data instanceof DataView) {
  //   return data.buffer;
  // }
  // throw new Error("Unsupported ArrayBufferLike:" + data);
};

const ctypeunpacker: {
  [key: string]: (
    data: ArrayBufferLike,
    littleEndian: boolean
  ) => string | number | boolean | null;
} = {
  x: (_data: ArrayBufferLike, _littleEndian: boolean) => {
    return null;
  }, //  pad byte 	no value 	(7 )
  c: (data: ArrayBufferLike, _littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getInt8(0);
  }, //  char 	bytes of length 1 	1 	b 	signed char 	integer 	1 	(1 ), (2 )
  B: (data: ArrayBufferLike, _littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getUint8(0);
  }, //  unsigned char 	integer 	1 	(2 )
  "?": (data: ArrayBufferLike, _littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getInt8(0) === 1;
  }, //  _Bool 	bool 	1 	(1 )
  h: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getInt16(0, littleEndian);
  }, //  short 	integer 	2 	(2 )
  H: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getUint16(0, littleEndian);
  }, //  unsigned short 	integer 	2 	(2 )
  i: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getInt32(0, littleEndian);
  }, //  int 	integer 	4 	(2 )
  I: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getUint32(0, littleEndian);
  }, //  unsigned int 	integer 	4 	(2 )
  l: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getInt32(0, littleEndian);
  }, //  long 	integer 	4 	(2 )
  L: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getUint32(0, littleEndian);
  }, //  unsigned long 	integer 	4 	(2 )
  q: (data: ArrayBufferLike, littleEndian: boolean) => {
    return Number(
      new DataView(to_arraybuffer(data)).getBigInt64(0, littleEndian)
    );
  }, //  long long 	integer 	8 	(2 )
  Q: (data: ArrayBufferLike, littleEndian: boolean) => {
    return Number(
      new DataView(to_arraybuffer(data)).getBigUint64(0, littleEndian)
    );
  }, //  unsigned long long 	integer 	8 	(2 )
  n: (data: ArrayBufferLike, littleEndian: boolean) => {
    return Number(
      new DataView(to_arraybuffer(data)).getBigInt64(0, littleEndian)
    );
  }, //  ssize_t 	integer 	(3 )
  N: (data: ArrayBufferLike, littleEndian: boolean) => {
    return Number(
      new DataView(to_arraybuffer(data)).getBigUint64(0, littleEndian)
    );
  }, //  size_t 	integer 	(3 )
  // "e":(data:ArrayBufferLike)=>{return new DataView(to_arraybuffer(data)).getFloat16(0)}, //  (6 ) float 	2 	(4 )
  f: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getFloat32(0, littleEndian);
  }, //  float 	float 	4 	(4 )
  d: (data: ArrayBufferLike, littleEndian: boolean) => {
    return new DataView(to_arraybuffer(data)).getFloat64(0, littleEndian);
  }, //  double 	float 	8 	(4 )
  s: (data: ArrayBufferLike, _littleEndian: boolean) => {
    return new TextDecoder().decode(to_arraybuffer(data));
  }, //  char[] 	bytes 	(9 )
  p: (data: ArrayBufferLike, _littleEndian: boolean) => {
    return new TextDecoder().decode(to_arraybuffer(data));
  }, //  char[] 	bytes 	(8 )
  P: (data: ArrayBufferLike, littleEndian: boolean) => {
    return Number(
      new DataView(to_arraybuffer(data)).getBigUint64(0, littleEndian)
    );
  }, //  void* 	int
};
export class CTypeStructure extends DataStructure<
  ArrayBufferLike,
  string | number | boolean | null
> {
  private _cType: string;
  private _value: string | number | boolean | null;

  constructor({ data, mime }: DataStructureProps<ArrayBufferLike>) {
    super({ data, mime });
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

interface JSONObject {
  [key: string]: JSONType;
}
type JSONType = string | number | boolean | null | JSONObject | JSONType[];

export class JSONStructure extends DataStructure<
  ArrayBufferLike,
  JSONType | undefined
> {
  private _json: JSONType | undefined;
  constructor({ data, mime }: DataStructureProps<any>) {
    super({ data, mime });
    if (data.length === 0) {
      this._json = undefined;
    } else {
      this._json = JSON.parse(new TextDecoder().decode(to_arraybuffer(data)));
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
    return JSON.stringify(this._json);
  }
}

export class TextStructure extends DataStructure<ArrayBufferLike, string> {
  private _value: string;
  constructor({ data, mime }: DataStructureProps<ArrayBufferLike>) {
    super({ data, mime });
    this._value = new TextDecoder().decode(to_arraybuffer(data));
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
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
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
