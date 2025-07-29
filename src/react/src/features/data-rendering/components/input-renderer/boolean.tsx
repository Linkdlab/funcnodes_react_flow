import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { InputRendererProps } from "./types";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";

export const BooleanInput = ({
  iostore,
  inputconverter,
}: InputRendererProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
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
