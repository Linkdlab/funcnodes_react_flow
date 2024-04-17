import { useContext, useEffect, useRef, useState } from "react";

import { Handle, Position } from "reactflow";
import { FuncNodesContext } from "../..";
import { FuncNodesReactFlowZustandInterface } from "../../../state/fnrfzst";
import { HandleWithPreview, pick_best_io_type } from "./io";
import { InLineOutput } from "./default_output_render";

const NodeOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring, otypestring] = pick_best_io_type(
    io.type,
    render.typemap || {}
  );

  return (
    <div className="nodeoutput">
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Right}
        type="source"
      />

      <div className="ioname">{io.name}</div>

      <div className="iovaluefield">
        <InLineOutput io={io} />
      </div>
    </div>
  );
};

export default NodeOutput;
