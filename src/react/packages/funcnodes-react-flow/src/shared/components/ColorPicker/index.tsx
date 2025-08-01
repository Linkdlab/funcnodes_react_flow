import * as React from "react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as convert from "color-convert";
import "./colorpicker.scss";

const create_color_converter = (
  type: string,
  inputData: number[] | string[]
): { [key: string]: () => number[] | string } => {
  const data = Array.isArray(inputData) ? inputData : [inputData];
  if (data[0] === undefined || data[0] === null) {
    return create_color_converter("rgb", [0, 0, 0]);
  }

  // @ts-ignore
  const source = convert.default[type];
  if (!source) {
    throw new Error(
      `Unsupported color type: ${type} allowed are ${Object.keys(convert).join(
        ", "
      )}`
    );
  }

  // necessary to add the identity function to the source object
  source[type] = () => data;

  // Validate conversion outputs
  const validConversion = (fn: (...args: any[]) => any) => {
    const result = fn(...data);
    return Array.isArray(result) ? result[0] != null : result;
  };
  if (!validConversion(source.rgb) || !validConversion(source.hsl)) {
    return create_color_converter("rgb", [0, 0, 0]);
  }

  const converter: { [key: string]: () => number[] | string } = {};
  Object.keys(source).forEach((key) => {
    const fn = source[key];
    if (typeof fn === "function") {
      converter[key] = () => {
        // For the original type, simply return the base data
        if (key === type) return data;
        return fn(...data);
      };
    }
  });

  return converter;
};

const HSLColorPicker = ({
  onChange,
  colorconverter,
  allow_null = false,
}: {
  onChange: (
    colorconverter: {
      [key: string]: () => number[] | string;
    } | null
  ) => void;
  colorconverter: {
    [key: string]: () => number[] | string;
  } | null;
  allow_null?: boolean;
}) => {
  if (colorconverter === null && !allow_null)
    throw new Error("Color converter is null");
  const [converter, setConverter] = useState(colorconverter);
  const [hsl, setHsl] = useState([0, 0, 0]);
  const [rgb, setRgb] = useState([0, 0, 0]);
  const [hsv, setHsv] = useState([0, 0, 0]);
  const [hex, setHex] = useState("000");

  useEffect(() => {
    if (!converter) {
      if (!allow_null) throw new Error("Color converter is null");
      setRgb([0, 0, 0]);
      setHsl([0, 0, 0]);
      setHsv([0, 0, 0]);
      setHex("");
      return;
    }
    setHsl(converter.hsl() as number[]);
    setRgb(converter.rgb() as number[]);
    setHsv(converter.hsv() as number[]);
    setHex(converter.hex() as string);
  }, [converter]);

  const colorStyle = {
    backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
    padding: "10px",
    margin: "10px 0",
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      <div style={colorStyle}>Color Preview</div>
      <div className="colorspace">
        <div className="colorspace_title">RGB</div>
        <div></div>

        <label>Red</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb[0]}
          onChange={(e) => {
            const new_rgb = [parseInt(e.target.value), rgb[1], rgb[2]];
            const new_converter = create_color_converter("rgb", new_rgb);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{ background: `linear-gradient(to right, #000, #f00)` }}
        />

        <label>Green</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb[1]}
          onChange={(e) => {
            const new_rgb = [rgb[0], parseInt(e.target.value), rgb[2]];
            const new_converter = create_color_converter("rgb", new_rgb);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{ background: `linear-gradient(to right, #000, #0f0)` }}
        />

        <label>Blue</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb[2]}
          onChange={(e) => {
            const new_rgb = [rgb[0], rgb[1], parseInt(e.target.value)];
            const new_converter = create_color_converter("rgb", new_rgb);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{ background: `linear-gradient(to right, #000, #00f)` }}
        />
      </div>
      <div className="colorspace">
        <div className="colorspace_title">HSL</div>
        <div></div>

        <label>Hue</label>
        <input
          type="range"
          min="0"
          max="360"
          value={hsl[0]}
          onChange={(e) => {
            const new_hsl = [parseInt(e.target.value), hsl[1], hsl[2]];
            const new_converter = create_color_converter("hsl", new_hsl);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
          }}
        />

        <label>Saturation</label>
        <input
          type="range"
          min="0"
          max="100"
          value={hsl[1]}
          onChange={(e) => {
            const new_hsl = [hsl[0], parseInt(e.target.value), hsl[2]];
            const new_converter = create_color_converter("hsl", new_hsl);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #fff, hsl(${hsl[0]}, 100%, 50%))`,
          }}
        />

        <label>Lightness</label>

        <input
          type="range"
          min="0"
          max="100"
          value={hsl[2]}
          onChange={(e) => {
            const new_hsl = [hsl[0], hsl[1], parseInt(e.target.value)];
            const new_converter = create_color_converter("hsl", new_hsl);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #000, hsl(${hsl[0]}, 100%, 50%), #fff)`,
          }}
        />
      </div>

      <div className="colorspace">
        <div className="colorspace_title">HSV</div>
        <div></div>

        <label>Hue</label>
        <input
          type="range"
          min="0"
          max="360"
          value={hsv[0]}
          onChange={(e) => {
            const new_hsv = [parseInt(e.target.value), hsv[1], hsv[2]];
            const new_converter = create_color_converter("hsv", new_hsv);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
          }}
        />

        <label>Saturation</label>
        <input
          type="range"
          min="0"
          max="100"
          value={hsv[1]}
          onChange={(e) => {
            const new_hsv = [hsv[0], parseInt(e.target.value), hsv[2]];
            const new_converter = create_color_converter("hsv", new_hsv);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #fff, hsl(${hsl[0]}, 100%, 50%))`,
          }}
        />

        <label>Value</label>
        <input
          type="range"
          min="0"
          max="100"
          value={hsv[2]}
          onChange={(e) => {
            const new_hsv = [hsv[0], hsv[1], parseInt(e.target.value)];
            const new_converter = create_color_converter("hsv", new_hsv);
            setConverter(new_converter);
            onChange(new_converter);
          }}
          style={{
            background: `linear-gradient(to right, #000, hsl(${hsl[0]}, 100%, 50%))`,
          }}
        />
      </div>

      <div className="colorspace">
        <div className="colorspace_title">HEX</div>
        <div></div>

        <input
          type="text"
          value={hex}
          onChange={(e) => {
            const new_converter =
              e.target.value === ""
                ? null
                : create_color_converter("hex", [e.target.value]);
            setConverter(new_converter);
            onChange(new_converter);
          }}
        />
      </div>
    </div>
  );
};

interface CustomColorPickerProps {
  inicolordata?: number[] | string | string[];
  inicolorspace?: string;
  allow_null?: boolean;
  delay?: number; // delay in milliseconds (default is 1000ms)
  onChange?: (
    converter: { [key: string]: () => number[] | string } | null
  ) => void;
  portalContainer?: Element | null;
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  inicolordata,
  inicolorspace,
  allow_null = false,
  delay = 1000,
  onChange,
  portalContainer,
}) => {
  // Use local variables rather than mutating props.
  const initialColorData =
    inicolordata !== undefined ? inicolordata : [0, 0, 0];
  const initialColorSpace =
    inicolordata === undefined ? "rgb" : inicolorspace || "hex";

  // Ensure initialColorData is an array.
  const normalizedColorData = Array.isArray(initialColorData)
    ? initialColorData
    : [initialColorData];

  // Memoize the initial converter to avoid re-creating on each render.
  const initialConverter = useMemo(() => {
    let conv = create_color_converter(initialColorSpace, normalizedColorData);
    // Fallback to black if conversion fails.
    if (conv.rgb() === undefined) {
      conv = create_color_converter("rgb", [0, 0, 0]);
    }
    return conv;
  }, [initialColorSpace, normalizedColorData]);

  const [color, setColor] = useState(initialConverter);

  // Update internal state when external props change.
  useEffect(() => {
    // Use JSON.stringify for a simple deep comparison on arrays/strings.
    const data = inicolordata !== undefined ? inicolordata : [0, 0, 0];
    const space = inicolordata === undefined ? "rgb" : inicolorspace || "hex";
    const normData = Array.isArray(data) ? data : [data];
    let newConverter = create_color_converter(space, normData);
    if (newConverter.rgb() === undefined) {
      newConverter = create_color_converter("rgb", [0, 0, 0]);
    }
    setColor(newConverter);
  }, [JSON.stringify(inicolordata), inicolorspace]);

  // useRef to store the debounce timer.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced onChange: clear any existing timer and schedule a new one.
  const innerSetColor = useCallback(
    (colorconverter: { [key: string]: () => number[] | string } | null) => {
      if (colorconverter === null && !allow_null)
        throw new Error("Color is null");

      // Update local state immediately.
      if (colorconverter !== null) setColor(colorconverter);

      // Clear any existing timer.
      if (timerRef.current) clearTimeout(timerRef.current);
      // Set up a new timer to call onChange after the specified delay.
      if (onChange) {
        timerRef.current = setTimeout(() => {
          onChange(colorconverter);
          timerRef.current = null;
        }, delay);
      }
    },
    [allow_null, onChange, delay]
  );

  // Clean up the timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Memoize button style to prevent unnecessary renders.
  const buttonStyle = useMemo(
    () => ({
      background: "#" + color.hex(),
      borderRadius: "0.3rem",
      width: "2rem",
      height: "1rem",
    }),
    [color]
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button style={buttonStyle} />
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <Popover.Content side="left" className="iotooltipcontent">
          <HSLColorPicker
            onChange={innerSetColor}
            colorconverter={color}
            allow_null={allow_null}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { HSLColorPicker };
