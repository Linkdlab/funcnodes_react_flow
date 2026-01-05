import * as React from "react";
import { InputRendererProps } from "./types";
import { useIOStore } from "@/nodes";
import { useSetIOValue } from "@/nodes-io-hooks";

export const BooleanInput = ({ inputconverter }: InputRendererProps) => {
  const iostore = useIOStore();
  const { preview } = iostore.valuestore();
  const io = iostore.use();

  const indeterminate = preview?.value === undefined;
  const cRef = React.useRef<HTMLInputElement>(null);

  const set_io_value = useSetIOValue(io);

  React.useEffect(() => {
    if (!cRef.current) return;
    cRef.current.indeterminate = indeterminate;
  }, [cRef, indeterminate]);

  const on_change = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let new_value: boolean = e.target.checked;
      try {
        new_value = inputconverter[0](e.target.checked);
      } catch (e) {}
      set_io_value(new_value);
    },
    [set_io_value, inputconverter]
  );
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
