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

export class ArrayBufferDataStructure<
  D extends ArrayBufferLike
> extends DataStructure<D, string> {
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

const ctypeunpacker = {
  x: (_data: ArrayBufferLike) => {
    return null;
  }, //  pad byte 	no value 	(7 )
  c: (data: ArrayBufferLike) => {
    return new DataView(data).getInt8(0);
  }, //  char 	bytes of length 1 	1 	b 	signed char 	integer 	1 	(1 ), (2 )
  B: (data: ArrayBufferLike) => {
    return new DataView(data).getUint8(0);
  }, //  unsigned char 	integer 	1 	(2 )
  "?": (data: ArrayBufferLike) => {
    return new DataView(data).getInt8(0) === 1;
  }, //  _Bool 	bool 	1 	(1 )
  h: (data: ArrayBufferLike) => {
    return new DataView(data).getInt16(0);
  }, //  short 	integer 	2 	(2 )
  H: (data: ArrayBufferLike) => {
    return new DataView(data).getUint16(0);
  }, //  unsigned short 	integer 	2 	(2 )
  i: (data: ArrayBufferLike) => {
    return new DataView(data).getInt32(0);
  }, //  int 	integer 	4 	(2 )
  I: (data: ArrayBufferLike) => {
    return new DataView(data).getUint32(0);
  }, //  unsigned int 	integer 	4 	(2 )
  l: (data: ArrayBufferLike) => {
    return new DataView(data).getInt32(0);
  }, //  long 	integer 	4 	(2 )
  L: (data: ArrayBufferLike) => {
    return new DataView(data).getUint32(0);
  }, //  unsigned long 	integer 	4 	(2 )
  q: (data: ArrayBufferLike) => {
    return new DataView(data).getBigInt64(0);
  }, //  long long 	integer 	8 	(2 )
  Q: (data: ArrayBufferLike) => {
    return new DataView(data).getBigUint64(0);
  }, //  unsigned long long 	integer 	8 	(2 )
  n: (data: ArrayBufferLike) => {
    return new DataView(data).getBigInt64(0);
  }, //  ssize_t 	integer 	(3 )
  N: (data: ArrayBufferLike) => {
    return new DataView(data).getBigUint64(0);
  }, //  size_t 	integer 	(3 )
  // "e":(data:ArrayBufferLike)=>{return new DataView(data).getFloat16(0)}, //  (6 ) float 	2 	(4 )
  f: (data: ArrayBufferLike) => {
    return new DataView(data).getFloat32(0);
  }, //  float 	float 	4 	(4 )
  d: (data: ArrayBufferLike) => {
    return new DataView(data).getFloat64(0);
  }, //  double 	float 	8 	(4 )
  s: (data: ArrayBufferLike) => {
    return new TextDecoder().decode(data);
  }, //  char[] 	bytes 	(9 )
  p: (data: ArrayBufferLike) => {
    return new TextDecoder().decode(data);
  }, //  char[] 	bytes 	(8 )
  P: (data: ArrayBufferLike) => {
    return new DataView(data).getBigUint64(0);
  }, //  void* 	int
};
export class CTypeStructure extends DataStructure<
  ArrayBufferLike,
  string | number | bigint | boolean | null
> {
  private _cType: keyof typeof ctypeunpacker;
  private _value: string | number | bigint | boolean | null;

  constructor({ data, mime }: DataStructureProps<ArrayBufferLike>) {
    super({ data, mime });
    this._cType = mime.split(
      "application/fn.struct."
    )[1] as keyof typeof ctypeunpacker;
    this._value = ctypeunpacker[this._cType](data);
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
      this._json = JSON.parse(new TextDecoder().decode(data));
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
    this._value = new TextDecoder().decode(data);
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
