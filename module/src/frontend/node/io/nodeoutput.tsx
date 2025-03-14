import { useContext } from "react";

import { Position } from "reactflow";
import { FuncNodesContext } from "../../funcnodesreactflow";

import { HandleWithPreview, pick_best_io_type } from "./io";
import { InLineOutput } from "./default_output_render";
import {
  RenderOptions,
  FuncNodesReactFlowZustandInterface,
} from "../../../states/fnrfzst.t";
import { IOStore } from "../../../states/nodeio.t";
import * as React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";

const NodeOutput = ({ iostore }: { iostore: IOStore }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const io = iostore.use();
  console.log("render_output");

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});
  const { Outputrenderer } = useContext(RenderMappingContext);
  const Output = typestring ? Outputrenderer[typestring] : undefined;
  if (io.hidden) {
    return null;
  }
  return (
    <div className="nodeoutput" {...{ "data-type": typestring }}>
      <HandleWithPreview
        iostore={iostore}
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
          <InLineOutput iostore={iostore} typestring={typestring} />
        </div>
      )}
    </div>
  );
};

export default NodeOutput;
