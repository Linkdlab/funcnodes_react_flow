import { useContext } from "react";

import { Position } from "@xyflow/react";
import { FuncNodesContext } from "../../funcnodesreactflow";

import { HandleWithPreview, pick_best_io_type } from "./io";

import {
  RenderOptions,
  FuncNodesReactFlowZustandInterface,
} from "../../../states/fnrfzst.t";

import * as React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";
import { latest } from "../../../types/versioned/versions.t";
import { InLineOutput } from "../../datarenderer/default_output_renderer";

const NodeOutput = ({ iostore }: { iostore: latest.IOStore }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const io = iostore.use();

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
      <div className="inner_nodeio">
        <div className="ioname">{io.name}</div>
        {Output ? (
          <div className="iovaluefield nodrag">
            <Output iostore={iostore} />
          </div>
        ) : (
          <div className="iovaluefield">
            <InLineOutput iostore={iostore} typestring={typestring} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeOutput;
