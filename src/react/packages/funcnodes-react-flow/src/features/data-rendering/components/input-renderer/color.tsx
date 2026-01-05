import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { InputRendererProps } from "./types";

import { CustomColorPicker } from "@/shared-components";
import { useIOStore } from "@/nodes";
import { useSetIOValue } from "@/nodes-io-hooks";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const ColorInput = ({}: InputRendererProps) => {
  const iostore = useIOStore();
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const io = iostore.use();
  const { preview, full } = iostore.valuestore();
  const display = full === undefined ? preview?.value : full.value;
  const set_io_value = useSetIOValue(io);
  const typeddisplay: string | number[] | undefined =
    typeof display === "string"
      ? display
      : Array.isArray(display) && display.every((x) => typeof x === "number")
      ? display
      : undefined;

  const colorspace = io.value_options?.colorspace || "hex";

  const on_change = React.useCallback(
    (
      colorconverter?: {
        [key: string]: () => number[] | string;
      } | null
    ) => {
      let new_value: string | number[] | null = "<NoValue>";
      if (colorconverter) {
        if (colorconverter[colorspace])
          new_value = colorconverter[colorspace]();
        else new_value = colorconverter.hex();
      }
      if (colorconverter === null) new_value = null;
      try {
        new_value = new_value;
      } catch (e) {}
      set_io_value(new_value);
    },
    [set_io_value, colorspace]
  );

  let allow_null = false;
  if (
    typeof io.type !== "string" &&
    "anyOf" in io.type &&
    io.type.anyOf !== undefined
  ) {
    allow_null = io.type.anyOf.some((x) => x === "None");
  }
  const portal = fnrf_zst.local_state(() => fnrf_zst.reactflowRef);

  return (
    <CustomColorPicker
      onChange={on_change}
      inicolordata={typeddisplay}
      allow_null={allow_null}
      inicolorspace={colorspace}
      portalContainer={portal}
    />
  );
};
