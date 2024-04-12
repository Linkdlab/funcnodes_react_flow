import { useContext, useEffect, useRef, useState } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../../state";

import { FuncNodesContext } from "../../funcnodesreactflow";
import CustomColorPicker from "../../utils/colorpicker";
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
      new_value = inputconverter(e.target.checked);
    } catch (e) {}
    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };
  return (
    <input
      ref={cRef}
      type="checkbox"
      className="styledcheckbox"
      checked={!!io.value}
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

  const [tempvalue, setTempValue] = useState(io.value);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: number | string = parser(e.target.value);

    if (isNaN(new_value)) {
      new_value = "<NoValue>";
    }
    try {
      new_value = inputconverter(new_value);
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <input
      type="number"
      className="nodedatainput styledinput"
      value={io.connected ? io.value : tempvalue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={on_change}
      disabled={io.connected}
      step={io.render_options?.step}
      min={io.value_options?.min}
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

  const [tempvalue, setTempValue] = useState(io.value);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: string = e.target.value;
    try {
      new_value = inputconverter(new_value);
    } catch (e) {}

    if (!new_value) new_value = "<NoValue>";

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <input
      className="nodedatainput styledinput"
      value={io.connected ? io.value : tempvalue}
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

  const on_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Find the selected option element
    const selectedOption = e.target.options[e.target.selectedIndex];
    // Retrieve the datatype attribute from the selected option
    const datatype = selectedOption.getAttribute("datatype");

    // Use the existing parser or get a new one based on the datatype
    const p = parser || get_parser(datatype);

    let new_value: string | number = p(e.target.value);
    try {
      new_value = inputconverter(e.target.value);
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: p(e.target.value),
      set_default: io.render_options?.set_default || false,
    });
  };
  let v = io.value;
  if (v === null) {
    v = "null";
  }
  if (v === undefined) {
    v = "undefined";
  }
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

const ColorInput = ({ io, inputconverter }: InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const colorspace = io.value_options?.colorspace || "hex";

  const on_change = (colorconverter?: {
    [key: string]: () => number[] | string;
  }) => {
    let new_value: string | number[] = "<NoValue>";
    if (colorconverter) {
      if (colorconverter[colorspace]) new_value = colorconverter[colorspace]();
      else new_value = colorconverter.hex();
    }
    try {
      new_value = new_value;
    } catch (e) {}

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <CustomColorPicker
      onChange={on_change}
      inicolordata={io.value}
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
