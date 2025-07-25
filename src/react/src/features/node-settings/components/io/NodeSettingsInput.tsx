import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import {
  RenderMappingContext,
  latest,
  SelectionInput,
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "@/barrel_imports";
import { pick_best_io_type, INPUTCONVERTER } from "@/nodes";

export const NodeSettingsInput = ({ iostore }: { iostore: latest.IOStore }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();
  const io = iostore.use();

  const [typestring, otypestring] = pick_best_io_type(
    io.render_options.type,
    render.typemap || {}
  );
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
      {Input && <Input iostore={iostore} inputconverter={inputconverterf} />}
      <div>
        <label>
          hidden:
          <input
            className="styledcheckbox"
            type="checkbox"
            disabled={io.connected}
            onChange={(e) => {
              io.set_hidden?.(e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};
