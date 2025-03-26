import * as React from "react";
import { latest } from "../../types/versioned/versions.t";

import { Base64BytesRenderer } from "./default_data_view_renderer";

import * as Slider from "@radix-ui/react-slider";
import * as ToolTip from "@radix-ui/react-tooltip";
import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import CustomColorPicker from "../utils/colorpicker";
import CustomSelect from "../utils/select";

export const NumberInput = ({
  iostore,
  inputconverter,
  parser = (n: string) => parseFloat(n),
}: latest.InputRendererProps & {
  parser: (n: string) => number;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);

  const { preview } = iostore.valuestore();
  const io = iostore.use();

  const [tempvalue, setTempValue] = React.useState(
    inputconverter[1](preview?.value)
  );

  React.useEffect(() => {
    setTempValue(inputconverter[1](preview?.value));
  }, [preview]);

  const set_new_value = (new_value: number | string) => {
    new_value = parser(
      parseFloat(new_value.toString()).toString() // parse float first for e notation
    );

    if (isNaN(new_value)) {
      new_value = "<NoValue>";
      setTempValue("");
    } else {
      if (
        io.value_options?.min !== undefined &&
        new_value < io.value_options.min
      )
        new_value = io.value_options.min;
      if (
        io.value_options?.max !== undefined &&
        new_value > io.value_options.max
      )
        new_value = io.value_options.max;
      setTempValue(new_value.toString());
    }
    try {
      new_value = inputconverter[0](new_value);
    } catch (e) {}
    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options.set_default,
    });
  };

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_new_value(e.target.value);
  };
  let v = io.connected ? inputconverter[1](preview?.value) : tempvalue;
  if (v === undefined) v = io.value_options?.min;
  if (v === undefined) v = io.value_options?.max;
  if (v === undefined) v = "";
  if (v === null) v = "";

  if (
    io.value_options?.max !== undefined &&
    io.value_options?.min !== undefined
  ) {
    return (
      <div style={{ minWidth: "100px" }} className="SliderContainer">
        <Slider.Root
          className="SliderRoot"
          value={[v === undefined ? io.value_options?.min : v]}
          min={io.value_options?.min}
          max={io.value_options?.max}
          step={
            io.value_options.step ||
            (io.value_options?.max - io.value_options?.min) / 1000
          }
          disabled={io.connected}
          onValueCommit={(value) => {
            if (isNaN(value[0])) return;
            set_new_value(value[0]);
          }}
          onValueChange={(value) => {
            if (isNaN(value[0])) return;
            setTempValue(value[0].toString());
          }}
        >
          <Slider.Track className="SliderTrack">
            <Slider.Range className="SliderRange" />
          </Slider.Track>
          <ToolTip.TooltipProvider>
            <ToolTip.Root open>
              <ToolTip.Trigger asChild>
                <Slider.Thumb className="SliderThumb" />
              </ToolTip.Trigger>
              <ToolTip.Content className="SliderTooltipContent">
                {v}
              </ToolTip.Content>
            </ToolTip.Root>
          </ToolTip.TooltipProvider>
        </Slider.Root>
      </div>
    );
  }
  return (
    <input
      type="text"
      className="nodedatainput styledinput numberinput"
      value={v}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={on_change}
      onKeyDown={(e) => {
        // on key up add step to value

        if (e.key === "ArrowUp") {
          let step = io.value_options?.step || 1;
          if (e.shiftKey) step *= 10;

          let new_value = (parseFloat(v) || 0) + step;
          // setTempValue(new_value.toString());
          set_new_value(new_value);
          return;
        }

        // on key down subtract step to value
        if (e.key === "ArrowDown") {
          let step = io.value_options?.step || 1;
          if (e.shiftKey) step *= 10;
          let new_value = (parseFloat(v) || 0) - step;
          // setTempValue(new_value.toString());
          set_new_value(new_value);
          return;
        }

        //accept only numbers
        if (
          !/^[0-9.eE+-]$/.test(e.key) &&
          !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(
            e.key
          )
        ) {
          e.preventDefault();
        }
      }}
      disabled={io.connected}
      step={io.value_options?.step}
      min={io.value_options?.min}
      max={io.value_options?.max}
    />
  );
};

export const FloatInput = ({
  iostore,
  inputconverter,
}: latest.InputRendererProps) => {
  return NumberInput({ iostore, inputconverter, parser: parseFloat });
};

export const IntegerInput = ({
  iostore,
  inputconverter,
}: latest.InputRendererProps) => {
  return NumberInput({ iostore, inputconverter, parser: parseInt });
};

export const BooleanInput = ({
  iostore,
  inputconverter,
}: latest.InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);
  const { preview } = iostore.valuestore();
  const io = iostore.use();

  const indeterminate = preview?.value === undefined;
  const cRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!cRef.current) return;
    cRef.current.indeterminate = indeterminate;
  }, [cRef, indeterminate]);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: boolean = e.target.checked;
    try {
      new_value = inputconverter[0](e.target.checked);
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options.set_default,
    });
  };
  return (
    <input
      ref={cRef}
      type="checkbox"
      className="styledcheckbox booleaninput"
      checked={!!inputconverter[1](preview?.value)}
      onChange={on_change}
      disabled={io.connected}
    />
  );
};

export const StringInput = ({
  iostore,
  inputconverter,
}: latest.InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);

  const { preview, full } = iostore.valuestore();
  const io = iostore.use();
  const display = full === undefined ? preview?.value : full?.value;

  const [tempvalue, setTempValue] = React.useState(inputconverter[1](display));

  React.useEffect(() => {
    setTempValue(inputconverter[1](display));
  }, [display]);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: string = e.target.value;

    if (!new_value) new_value = "<NoValue>";
    try {
      new_value = inputconverter[0](new_value);
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options.set_default,
    });
  };

  let v = io.connected ? inputconverter[1](display) : tempvalue;
  if (v === undefined || v === null) v = "";
  return (
    <input
      className="nodedatainput styledinput stringinput"
      value={v}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={on_change}
      disabled={io.connected}
    />
  );
};

export const ColorInput = ({ iostore }: latest.InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);
  const io = iostore.use();
  const { preview, full } = iostore.valuestore();
  const display = full === undefined ? preview?.value : full.value;

  const colorspace = io.value_options?.colorspace || "hex";

  const on_change = (
    colorconverter?: {
      [key: string]: () => number[] | string;
    } | null
  ) => {
    let new_value: string | number[] | null = "<NoValue>";
    if (colorconverter) {
      if (colorconverter[colorspace]) new_value = colorconverter[colorspace]();
      else new_value = colorconverter.hex();
    }
    if (colorconverter === null) new_value = null;
    try {
      new_value = new_value;
    } catch (e) {}
    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options.set_default,
    });
  };

  let allow_null = false;
  if (
    typeof io.type !== "string" &&
    "anyOf" in io.type &&
    io.type.anyOf !== undefined
  ) {
    allow_null = io.type.anyOf.some((x) => x === "None");
  }
  return (
    <CustomColorPicker
      onChange={on_change}
      inicolordata={display}
      allow_null={allow_null}
      inicolorspace={colorspace}
    />
  );
};

const _parse_string = (s: string) => s;
const _parse_number = (s: string) => parseFloat(s);
const _parse_boolean = (s: string) => !!s;
const _parse_null = (s: string) => (s === "null" ? null : s);

const get_parser = (datatype: string | null) => {
  if (datatype === "nuinputconvertermber") {
    return _parse_number;
  }
  if (datatype === "boolean") {
    return _parse_boolean;
  }
  if (datatype === "undefined") {
    return _parse_null;
  }
  return _parse_string;
};

type SelectionInputOptionType = {
  value: string;
  label: string;
  datatype: string; // Extra property not required by CustomSelect
};

export const SelectionInput = ({
  iostore,
  inputconverter,
  parser,
}: latest.InputRendererProps & {
  parser?(s: string): any;
}) => {
  const io = iostore.use();
  const { preview, full } = iostore.valuestore();
  const display = full === undefined ? preview?.value : full.value;

  let options: (string | number)[] | latest.EnumOf | any =
    io.value_options?.options || [];

  if (Array.isArray(options)) {
    options = {
      type: "enum",
      values: options,
      keys: options.map((x) => (x === null ? "None" : x.toString())),
      nullable: false,
    };
  }

  if (options.type !== "enum") {
    options = {
      type: "enum",
      values: Object.values(options),
      keys: Object.keys(options),
      nullable: false,
    };
  }

  options = options as latest.EnumOf;
  if (
    options.nullable &&
    !options.values.includes(null) &&
    !options.keys.includes("None")
  ) {
    options.values.unshift(null);
    options.keys.unshift("None");
  }
  //make key value pairs
  const optionsmap: [string, string, string][] = [];
  for (let i = 0; i < options.values.length; i++) {
    // set const t to "string", "number","boolean" "null" depenting on the type of options.values[i]
    const t =
      options.values[i] === null || options.values[i] === undefined
        ? "undefined"
        : typeof options.values[i];
    let v = options.values[i];

    if (v === null) {
      v = "null";
    }
    if (v === undefined) {
      v = "undefined";
    }
    optionsmap.push([options.keys[i], v.toString(), t]);
  }

  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    React.useContext(FuncNodesContext);

  const on_change_value = ({
    value,
    // label
    datatype,
  }: {
    value: string;
    // label: string;
    datatype: string;
  }) => {
    // Use the existing parser or get a new one based on the datatype
    const p = parser || get_parser(datatype);

    let new_value: string | number = p(value);
    try {
      new_value = inputconverter[0](value);
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options.set_default,
    });
  };

  let v = display;
  if (v === null) {
    v = "null";
  }
  if (v === undefined) {
    v = "undefined";
  }
  const default_entry = optionsmap.find((option) => option[1] === v.toString());

  let default_value:
    | { value: string; label: string; datatype: string }
    | undefined;
  if (default_entry !== undefined) {
    default_value = {
      value: default_entry[1],
      label: default_entry[0],
      datatype: default_entry[2],
    };
  }
  const select_options: SelectionInputOptionType[] = optionsmap.map(
    (option) => ({
      value: option[1],
      label: option[0],
      datatype: option[2],
    })
  );
  return (
    // <Suspense fallback={<select disabled={true}></select>}>
    <CustomSelect
      className="nodedatainput styleddropdown"
      options={select_options}
      defaultValue={default_value}
      onChange={(newValue) => {
        if (newValue === null) {
          on_change_value({
            value: "<NoValue>",

            datatype: "string",
          });
          return;
        }
        on_change_value(newValue);
      }}
    />
    // </Suspense>
  );
};

export const DataViewRendererToInputRenderer = (
  DV: latest.DataViewRendererType,
  defaultValue: any = undefined
): latest.InputRendererType => {
  return ({ iostore }: latest.InputRendererProps) => {
    const { full, preview } = iostore.valuestore();
    const val = full === undefined ? preview : full;
    const renderval = val?.value || defaultValue;

    return <DV iostore={iostore} value={renderval} />;
  };
};

export const DefaultInputrenderer: {
  [key: string]: latest.InputRendererType | undefined;
} = {
  float: FloatInput,
  int: IntegerInput,
  bool: BooleanInput,
  string: StringInput,
  str: StringInput,
  color: ColorInput,
  select: SelectionInput,
  enum: SelectionInput,
  bytes: DataViewRendererToInputRenderer(Base64BytesRenderer, ""),
};
