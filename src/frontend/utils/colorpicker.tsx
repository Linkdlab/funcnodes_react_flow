import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import convert from "color-convert";
import "./colorpicker.scss";

const parse_colorstring = (colorstring: string): [string, any[]] => {
  // This is a simplified parser and may need adjustments to handle all CSS color formats robustly
  if (colorstring.startsWith("#")) {
    return ["hex", [colorstring]];
  }

  let matches = colorstring.match(/^(\w+)\(([^)]+)\)$/);
  if (!matches) return ["keyword", [colorstring]];

  const colortype = matches[1];
  const colordata = matches[2].split(",").map((n) => parseInt(n.trim()));

  return [colortype, colordata];
};

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
const create_color_converter_from_string = (
  colorstring: string
): { [key: string]: () => number[] | string } => {
  const [colortype, colordata] = parse_colorstring(colorstring);
  // @ts-ignore
  if (!colortype || !convert[colortype]) {
    console.error("Unsupported color type or invalid color string");
    return {};
  }

  return create_color_converter(colortype, colordata);
};

const HSLColorPicker = ({
  onChange,
  colorconverter,
}: {
  onChange: (colorconverter: {
    [key: string]: () => number[] | string;
  }) => void;
  colorconverter: { [key: string]: () => number[] | string };
}) => {
  const [converter, setConverter] = useState(colorconverter);
  const hsl = converter.hsl() as number[];
  const rgb = converter.rgb() as number[];
  const hsv = converter.hsv() as number[];
  const hex = converter.hex() as string;

  const colorStyle = {
    backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
    padding: "10px",
    margin: "10px 0",
  };

  let g = "linear-gradient(to right";
  for (let i = 0; i <= 360; i += 10) {
    g += `, hsl(${i}, 100%, 50%)`;
  }
  g += ")";
  const hueStyle = {
    backgroundImage: "unset",
    WebkitAppearance: "none" as any,
    background: g,
    height: 10,
    borderRadius: 5,
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
            const newrgb = [parseInt(e.target.value), rgb[1], rgb[2]];
            const newconverter = create_color_converter("rgb", newrgb);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newrgb = [rgb[0], parseInt(e.target.value), rgb[2]];
            const newconverter = create_color_converter("rgb", newrgb);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newrgb = [rgb[0], rgb[1], parseInt(e.target.value)];
            const newconverter = create_color_converter("rgb", newrgb);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsl = [parseInt(e.target.value), hsl[1], hsl[2]];
            const newconverter = create_color_converter("hsl", newhsl);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsl = [hsl[0], parseInt(e.target.value), hsl[2]];
            const newconverter = create_color_converter("hsl", newhsl);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsl = [hsl[0], hsl[1], parseInt(e.target.value)];
            const newconverter = create_color_converter("hsl", newhsl);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsv = [parseInt(e.target.value), hsv[1], hsv[2]];
            const newconverter = create_color_converter("hsv", newhsv);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsv = [hsv[0], parseInt(e.target.value), hsv[2]];
            const newconverter = create_color_converter("hsv", newhsv);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newhsv = [hsv[0], hsv[1], parseInt(e.target.value)];
            const newconverter = create_color_converter("hsv", newhsv);
            setConverter(newconverter);
            onChange(newconverter);
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
            const newconverter = create_color_converter("hex", [
              e.target.value,
            ]);
            setConverter(newconverter);
            onChange(newconverter);
          }}
        />
      </div>
    </div>
  );
};

const CustomColorPicker = ({
  inicolordata,
  inicolorspace = "hex",
  onChange,
}: {
  inicolordata?: number[] | string | string[];
  inicolorspace?: string;
  onChange?: (colorconverter: {
    [key: string]: () => number[] | string;
  }) => void;
}) => {
  if (inicolordata === undefined) {
    inicolordata = [0, 0, 0];
    inicolorspace = "rgb";
  }
  if (!Array.isArray(inicolordata)) inicolordata = [inicolordata];

  let iniconverter = create_color_converter(inicolorspace, inicolordata);
  console.log(iniconverter);
  console.log(iniconverter.hex());
  if (iniconverter.rgb() === undefined)
    iniconverter = create_color_converter("rgb", [0, 0, 0]);
  const [color, setColor] = useState(iniconverter);

  const innerSetColor = (colorconverter: {
    [key: string]: () => number[] | string;
  }) => {
    setColor(colorconverter);
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
          ></HSLColorPicker>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CustomColorPicker;
export { HSLColorPicker };
