import * as React from "react";
import { InputRendererProps } from "./types";

import { CustomSelect } from "@/shared-components";
import { useIOStore } from "@/nodes";
import { useSetIOValue } from "@/nodes-io-hooks";
import { EnumOf } from "@/nodes-core";

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
  inputconverter,
  parser,
}: InputRendererProps & {
  parser?(s: string): any;
}) => {
  const iostore = useIOStore();
  const io = iostore.use();
  const { preview, full } = iostore.valuestore();
  const display = full === undefined ? preview?.value : full.value;
  const set_io_value = useSetIOValue(io);
  let options: (string | number)[] | EnumOf | any =
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

  const on_change_value = React.useCallback(
    ({
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

      set_io_value(new_value);
    },
    [io, inputconverter, set_io_value]
  );

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
