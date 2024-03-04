import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import convert from "color-convert";

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

const create_color_converter = (type: string, data: any[]) => {
  // @ts-ignore
  const source = convert[type];
  if (!source) {
    throw new Error("Unsupported color type: " + type);
  }

  source[type] = () => data;

  const converter: { [key: string]: () => number[] } = {};

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
): { [key: string]: () => number[] } => {
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
  onChange: (colorconverter: { [key: string]: () => number[] }) => void;
  colorconverter: { [key: string]: () => number[] };
}) => {
  const [h, s, l] = colorconverter.hsl();
  const [hue, setHue] = useState(h); // Default to a blue hue
  const [saturation, setSaturation] = useState(s);
  const [lightness, setLightness] = useState(l);
  const arearef = useRef<HTMLDivElement>(null);

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHue(parseInt(e.target.value));
  const handleSaturationLightnessChange = (
    e: React.MouseEvent<HTMLElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.
    setSaturation((x / rect.width) * 100);
    setLightness(100 - (y / rect.height) * 100);
  };

  useEffect(() => {
    onChange(create_color_converter("hsl", [hue, saturation, lightness]));
  }, [hue, saturation, lightness]);

  const colorStyle = {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
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

  const satLightStyle = {
    background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%)), linear-gradient(to top, hsl(${hue}, 50%, 0%), hsl(${hue}, 50%, 100%))`,
    backgroundBlendMode: "overlay",
    width: 123,
    height: 123,
    cursor: "crosshair",
    margin: 5,
  };

  const markerstyle = {
    position: "relative" as any,
    width: 4,
    height: 4,
    borderRadius: 3,
    top: `calc(${100 - lightness}% - 3px)`,
    left: `calc(${saturation}% - 3px)`,
    border: "2px solid black",
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      <div style={colorStyle}>Color Preview</div>
      <div>
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={handleHueChange}
          style={hueStyle}
        />
      </div>
      <div
        onClick={handleSaturationLightnessChange}
        style={satLightStyle}
        ref={arearef}
      >
        <div style={markerstyle}></div>
      </div>
    </div>
  );
};

const CustomColorPicker = ({
  inicolor,
  onChange,
}: {
  inicolor?: string;
  onChange?: (colorconverter: { [key: string]: () => number[] }) => void;
}) => {
  if (inicolor === undefined) {
    inicolor = "rgb(0,0,0)";
  }
  const rgb = create_color_converter_from_string(inicolor).rgb();
  if (rgb !== undefined) inicolor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  else inicolor = "rgb(0,0,0)";
  const [color, setColor] = useState(inicolor);

  const converter = useMemo(
    () => create_color_converter_from_string(color),
    [color]
  );

  const innerSetColor = (colorconverter: { [key: string]: () => number[] }) => {
    const rgb = colorconverter.rgb();
    setColor(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    if (onChange) onChange(colorconverter);
  };

  const style = {
    background: color,
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
            colorconverter={converter}
          ></HSLColorPicker>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CustomColorPicker;
export { HSLColorPicker };
