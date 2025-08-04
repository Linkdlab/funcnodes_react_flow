import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { RenderOptions } from "@/data-rendering-types";
import { pick_best_io_type, INPUTCONVERTER, useIOStore } from "@/nodes";
import { RenderMappingContext, SelectionInput } from "@/data-rendering";

import { FuncNodesReactFlow } from "@/funcnodes-context";
import { io_set_hidden } from "@/nodes-core";

export const NodeSettingsInput = () => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();
  const iostore = useIOStore();
  const io = iostore.use();

  const [typestring, otypestring] = pick_best_io_type(io, render.typemap || {});
  const { Inputrenderer } = React.useContext(RenderMappingContext);
  const Input = typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[typestring]
    : undefined;

  const inputconverterf: [(v: any) => any, (v: any) => any] =
    INPUTCONVERTER[
      (otypestring && render.inputconverter?.[otypestring]) ?? ""
    ] || INPUTCONVERTER[""]!;

  return (
    <div className="nodesettings_component">
      <div>{io.name}</div>
      {Input && <Input inputconverter={inputconverterf} />}
      <div>
        <label>
          hidden:
          <input
            className="styledcheckbox"
            type="checkbox"
            disabled={io.connected}
            onChange={(e) => {
              io_set_hidden(iostore, e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};
