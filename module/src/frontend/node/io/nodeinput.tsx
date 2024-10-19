import { useContext } from "react";
import { FuncNodesContext } from "../..";
import { Position } from "reactflow";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../../states/fnrfzst.t";
import { HandleWithPreview, pick_best_io_type } from "./io";
import { SelectionInput } from "./default_input_renderer";
import { IOType } from "../../../states/nodeio.t";
import React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";

const INPUTCONVERTER: {
  [key: string]: [(v: any) => any, (v: any) => any];
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

const NodeInput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

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
    INPUTCONVERTER[(otypestring && render.inputconverter?.[otypestring]) ?? ""];
  return (
    <div className="nodeinput">
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Left}
        type="target"
      />

      {Input && (
        <div className="iovaluefield nodrag">
          <Input io={io} inputconverter={inputconverterf} />
        </div>
      )}
      <div className="ioname">{io.name}</div>
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

export default NodeInput;
export { INPUTCONVERTER };
