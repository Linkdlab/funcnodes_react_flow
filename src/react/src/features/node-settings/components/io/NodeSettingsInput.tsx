import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "../../../../frontend/node/io/io";
import { FuncNodesReactFlowZustandInterface } from "../../../../states/fnrfzst.t";
import { RenderMappingContext } from "../../../../frontend/datarenderer/rendermappings";
import { INPUTCONVERTER } from "../../../../frontend/node/io/nodeinput";
import { RenderOptions } from "../../../../states/fnrfzst.t";
import { latest } from "../../../../types/versioned/versions.t";
import { SelectionInput } from "../../../../frontend/datarenderer/default_input_renderer";

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
