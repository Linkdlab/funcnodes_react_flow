import * as React from "react";
import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as convert from "color-convert";
import "./colorpicker.scss";

const create_color_converter = (
  type: string,
  data: any[]
): { [key: string]: () => number[] | string } => {
  if (!Array.isArray(data)) data = [data];
  if (data[0] === undefined || data[0] === null)
    return create_color_converter("rgb", [0, 0, 0]);
  // @ts-ignore
  const source = convert[type];
  if (!source) throw new Error("Unsupported color type: " + type);

  source[type] = () => data;

  const checkrgb = source.rgb(data);
  if (!Array.isArray(checkrgb)) return create_color_converter("rgb", [0, 0, 0]);
  if (checkrgb[0] === undefined || checkrgb[0] === null)
    return create_color_converter("rgb", [0, 0, 0]);

  const checkhsl = source.hsl(data);
  if (!Array.isArray(checkhsl)) return create_color_converter("rgb", [0, 0, 0]);
  if (checkhsl[0] === undefined || checkhsl[0] === null)
    return create_color_converter("rgb", [0, 0, 0]);

  const converter: { [key: string]: () => number[] | string } = {};

  Object.keys(source).forEach((key) => {
    const entry = source[key];
    //check if entry is a function
    if (typeof entry === "function") {
      converter[key] = () => entry.apply(null, data);
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
  colorconverter: { [key: string]: () => number[] | string } | null;
  allow_null?: boolean;
}) => {
  if (colorconverter === null && !allow_null)
    throw new Error("Color converter is null");
  const [converter, setConverter] = useState(colorconverter);
  const [hsl, setHsl] = useState([0, 0, 0]);
  const [rgb, setRgb] = useState([0, 0, 0]);
  const [hsv, setHsv] = useState([0, 0, 0]);
  const [hex, setHex] = useState("000");
  // const hsl = converter.hsl() as number[];
  // const rgb = converter.rgb() as number[];
  // const hsv = converter.hsv() as number[];
  // const hex = converter.hex() as string;

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

const CustomColorPicker = ({
  inicolordata,
  inicolorspace = "hex",
  allow_null = false,
  onChange,
}: {
  inicolordata?: number[] | string | string[];
  inicolorspace?: string;
  allow_null?: boolean;
  onChange?: (
    colorconverter: {
      [key: string]: () => number[] | string;
    } | null
  ) => void;
}) => {
  if (inicolordata === undefined) {
    inicolordata = [0, 0, 0];
    inicolorspace = "rgb";
  }
  if (!Array.isArray(inicolordata)) inicolordata = [inicolordata];

  let iniconverter = create_color_converter(inicolorspace, inicolordata);

  if (iniconverter.rgb() === undefined)
    iniconverter = create_color_converter("rgb", [0, 0, 0]);
  const [color, setColor] = useState(iniconverter);

  const innerSetColor = (
    colorconverter: {
      [key: string]: () => number[] | string;
    } | null
  ) => {
    if (colorconverter === null && !allow_null)
      throw new Error("Color is null");
    if (colorconverter !== null) setColor(colorconverter);
    if (onChange) onChange(colorconverter);
  };

  const style = {
    background: "#" + color.hex(),
    borderRadius: "0.3rem",
    width: "2rem",
    height: "1rem",
  };
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button style={style}></button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="left">
          <HSLColorPicker
            onChange={innerSetColor}
            colorconverter={color}
            allow_null={allow_null}
          ></HSLColorPicker>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CustomColorPicker;
export { HSLColorPicker };
