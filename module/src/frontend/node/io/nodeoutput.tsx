import { useContext } from "react";

import { Position } from "reactflow";
import { FuncNodesContext } from "../../funcnodesreactflow";

import { HandleWithPreview, pick_best_io_type } from "./io";
import { InLineOutput } from "./default_output_render";
import {
  RenderOptions,
  FuncNodesReactFlowZustandInterface,
} from "../../../states/fnrfzst.t";
import { IOType } from "../../../states/nodeio.t";
import * as React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";

const NodeOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});
  const { Outputrenderer } = useContext(RenderMappingContext);
  const Output = typestring ? Outputrenderer[typestring] : undefined;

  return (
    <div className="nodeoutput">
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Right}
        type="source"
      />

      <div className="ioname">{io.name}</div>
      {Output ? (
        <div className="iovaluefield nodrag">
          <Output io={io} />
        </div>
      ) : (
        <div className="iovaluefield">
          <InLineOutput io={io} typestring={typestring} />
        </div>
      )}
    </div>
  );
};

export default NodeOutput;
