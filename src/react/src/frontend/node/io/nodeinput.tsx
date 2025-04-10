import { useContext } from "react";
import { FuncNodesContext } from "../../funcnodesreactflow";
import { Position } from "@xyflow/react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../../states/fnrfzst.t";
import { HandleWithPreview, pick_best_io_type } from "./io";

import * as React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";
import { latest } from "../../../types/versioned/versions.t";
import { SelectionInput } from "../../datarenderer/default_input_renderer";

const INPUTCONVERTER: {
  [key: string]: [(v: any) => any, (v: any) => any] | undefined;
} = {
  "": [(v: any) => v, (v: any) => v],
  str_to_json: [
    (v: any) => {
      return JSON.parse(v);
    },
    (v: any) => {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    },
  ],
  str_to_list: [
    (v: any) => {
      try {
        const a = JSON.parse(v);
        if (Array.isArray(a)) return a;
        return [a];
      } catch (e) {
        try {
          return JSON.parse("[" + v + "]");
        } catch (e) {}
      }

      throw new Error("Invalid list");
    },
    (v: any) => JSON.stringify(v),
  ],
};

const NodeInput = ({ iostore }: { iostore: latest.IOStore }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const io = iostore.use();
  const [typestring, otypestring] = pick_best_io_type(
    io.render_options.type,
    render.typemap || {}
  );
  const { Inputrenderer } = useContext(RenderMappingContext);
  const Input = typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[typestring]
    : undefined;

  const inputconverterf: [(v: any) => any, (v: any) => any] =
    INPUTCONVERTER[
      (otypestring && render.inputconverter?.[otypestring]) ?? ""
    ] || INPUTCONVERTER[""]!;
  if (io.hidden) return null;
  return (
    <div className="nodeinput" {...{ "data-type": typestring }}>
      <HandleWithPreview
        iostore={iostore}
        typestring={typestring}
        position={Position.Left}
        type="target"
      />

      {Input && (
        <div className="iovaluefield nodrag" {...{ "data-type": typestring }}>
          <Input iostore={iostore} inputconverter={inputconverterf} />
        </div>
      )}
      <div className="ioname">{io.name}</div>
      <HandleWithPreview
        iostore={iostore}
        typestring={typestring}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

export default NodeInput;
export { INPUTCONVERTER };
