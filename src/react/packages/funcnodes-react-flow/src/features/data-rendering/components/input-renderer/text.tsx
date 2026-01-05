import * as React from "react";
import { InputRendererProps } from "./types";
import { useIOStore } from "@/nodes";
import { useSetIOValue } from "@/nodes-io-hooks";

export const StringInput = ({ inputconverter }: InputRendererProps) => {
  const iostore = useIOStore();
  const { preview, full } = iostore.valuestore();
  // const [expanded, setExpanded] = React.useState(false);
  // const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const io = iostore.use();
  const display = full === undefined ? preview?.value : full?.value;
  const set_io_value = useSetIOValue(io);
  const [tempvalue, setTempValue] = React.useState(inputconverter[1](display));

  React.useEffect(() => {
    setTempValue(inputconverter[1](display));
  }, [display]);

  const on_change = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let new_value: string = e.target.value;

      if (!new_value) new_value = "<NoValue>";
      try {
        new_value = inputconverter[0](new_value);
      } catch (e) {}

      if (new_value === display) return; // no change
      set_io_value(new_value);
    },
    [set_io_value, inputconverter, display]
  );

  let v = io.connected ? inputconverter[1](display) : tempvalue;
  if (v === undefined || v === null) v = "";
  v = v.toString();

  // if (expanded) {
  const nLines = (v.toString().match(/\n/g) || []).length;
  const nCols = Math.max(...v.split("\n").map((x: string) => x.length), 0);

  return (
    <textarea
      // style={{
      //   maxHeight: expanded ? "inherit" : "2rem",
      // }}
      className="nodedatainput styledinput stringinput"
      value={v}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={(e) => {
        on_change(e);
        // setExpanded(false);
      }}
      // onFocus={() => {
      //   setExpanded(true);
      // }}
      disabled={io.connected}
      // ref={textareaRef}
      rows={nLines + 1}
      cols={nCols + 1}
    />
  );
};
