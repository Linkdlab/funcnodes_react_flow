import { useContext, useEffect, useRef, useState } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../../states/fnrfzst.t";

import { FuncNodesContext } from "../../funcnodesreactflow";
import CustomColorPicker from "../../utils/colorpicker";
import { EnumOf, InputRendererProps } from "../../../states/nodeio.t";
import React from "react";

import * as Slider from "@radix-ui/react-slider";
import * as ToolTip from "@radix-ui/react-tooltip";
import CustomSelect from "../../utils/select";

const BooleanInput = ({ io, inputconverter }: InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const indeterminate = io.value === undefined;
  const cRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      checked={!!inputconverter[1](io.value)}
      onChange={on_change}
      disabled={io.connected}
    />
  );
};
const NumberInput = ({
  io,
  inputconverter,
  parser = (n: string) => parseFloat(n),
}: InputRendererProps & {
  parser: (n: string) => number;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const [tempvalue, setTempValue] = useState(inputconverter[1](io.value));

  useEffect(() => {
    setTempValue(inputconverter[1](io.value));
  }, [io.value]);

  const set_new_value = (new_value: number | string) => {
    new_value = parser(
      parseFloat(new_value.toString()).toString() // parse float for e notation
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
  let v = io.connected ? inputconverter[1](io.value) : tempvalue;
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
            io.render_options.step ||
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
          let step = io.render_options.step || 1;
          if (e.shiftKey) step *= 10;

          let new_value = (parseFloat(v) || 0) + step;
          // setTempValue(new_value.toString());
          set_new_value(new_value);
          return;
        }

        // on key down subtract step to value
        if (e.key === "ArrowDown") {
          let step = io.render_options.step || 1;
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
      step={io.render_options.step}
      min={io.value_options?.min}
      max={io.value_options?.max}
    />
  );
};

const FloatInput = ({ io, inputconverter }: InputRendererProps) => {
  return NumberInput({ io, inputconverter, parser: parseFloat });
};

const IntegerInput = ({ io, inputconverter }: InputRendererProps) => {
  return NumberInput({ io, inputconverter, parser: parseInt });
};

const StringInput = ({ io, inputconverter }: InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const [tempvalue, setTempValue] = useState(inputconverter[1](io.value));

  useEffect(() => {
    setTempValue(inputconverter[1](io.value));
  }, [io.value]);

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

  let v = io.connected ? inputconverter[1](io.value) : tempvalue;
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

const SelectionInput = ({
  io,
  inputconverter,
  parser,
}: InputRendererProps & {
  parser?(s: string): any;
}) => {
  let options: (string | number)[] | EnumOf = io.value_options?.options || [];
  if (Array.isArray(options)) {
    options = {
      type: "enum",
      values: options,
      keys: options.map((x) => x.toString()),
      nullable: false,
    };
  }
  options = options as EnumOf;
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
    useContext(FuncNodesContext);

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
  const on_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Find the selected option element
    const selectedOption = e.target.options[e.target.selectedIndex];
    // Retrieve the datatype attribute from the selected option
    const datatype = selectedOption.getAttribute("datatype");

    on_change_value({
      value: e.target.value,
      // label: selectedOption.text,
      datatype: datatype || "string",
    });
  };
  let v = io.value;
  if (v === null) {
    v = "null";
  }
  if (v === undefined) {
    v = "undefined";
  }
  const default_entry = optionsmap.find((option) => option[1] === v);
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

  return (
    <CustomSelect
      className="nodedatainput styleddropdown"
      options={optionsmap.map((option) => ({
        value: option[1],
        label: option[0],
        datatype: option[2],
      }))}
      defaultValue={default_value}
      onChange={(newValue) => {
        if (newValue === null)
          newValue = {
            value: "<NoValue>",
            label: "<NoValue>",
            datatype: "string",
          };
        on_change_value(newValue);
      }}
    />
  );
  return (
    <select
      value={v}
      onChange={on_change}
      disabled={io.connected}
      className="nodedatainput styleddropdown"
    >
      <option value="<NoValue>" disabled>
        select
      </option>
      {optionsmap.map((option) => (
        <option key={option[0]} value={option[1]} datatype={option[2]}>
          {option[0]}
        </option>
      ))}
    </select>
  );
};

const ColorInput = ({ io }: InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

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
      inicolordata={io.value}
      allow_null={allow_null}
      inicolorspace={colorspace}
    />
  );
};

export {
  FloatInput,
  IntegerInput,
  BooleanInput,
  StringInput,
  SelectionInput,
  ColorInput,
};
