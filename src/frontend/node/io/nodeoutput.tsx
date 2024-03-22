import { useContext, useEffect, useRef, useState } from "react";

import { Handle, Position } from "reactflow";
import { NodeStore, RenderType } from "../../../state/node";
import { FuncNodesContext } from "../..";
import { FuncNodesReactFlowZustandInterface } from "../../../state/fnrfzst";
import { HandleWithPreview, pick_best_io_type } from "./io";
import {
  InLineOutput,
  SingleValueOutput,
  TableOutput,
} from "./default_output_render";

declare global {
  interface Window {
    funcnodes?: {
      globals?: {
        outputrenderer?: {
          GlobalOutputrenderer?: {
            [key: string]: OutputRendererType;
          };
          register_output_renderer?: (
            type: string,
            renderer: OutputRendererType
          ) => void;
          set_output_renderer?: (type: string, registered_type: string) => void;
        };
      };
    };
  }
}

if (window.funcnodes === undefined) {
  window.funcnodes = {};
}
if (window.funcnodes.globals === undefined) {
  window.funcnodes.globals = {};
}

if (window.funcnodes.globals.outputrenderer === undefined) {
  window.funcnodes.globals.outputrenderer = {};
}

if (
  window.funcnodes.globals.outputrenderer.GlobalOutputrenderer === undefined
) {
  window.funcnodes.globals.outputrenderer.GlobalOutputrenderer = {
    string: SingleValueOutput,
    table: TableOutput,
  };
}

if (
  window.funcnodes.globals.outputrenderer.register_output_renderer === undefined
) {
  window.funcnodes.globals.outputrenderer.register_output_renderer = (
    type: string,
    renderer: OutputRendererType
  ) => {
    if (window.funcnodes?.globals?.outputrenderer?.GlobalOutputrenderer)
      window.funcnodes.globals.outputrenderer.GlobalOutputrenderer[type] =
        renderer;
  };
}
if (!("set_output_renderer" in window.funcnodes.globals.outputrenderer)) {
  window.funcnodes.globals.outputrenderer.set_output_renderer = (
    type: string,
    registered_type: string
  ) => {
    if (window.funcnodes?.globals?.outputrenderer?.GlobalOutputrenderer)
      window.funcnodes.globals.outputrenderer.GlobalOutputrenderer[type] =
        window.funcnodes.globals.outputrenderer.GlobalOutputrenderer[
          registered_type
        ];
  };
}

const NodeOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();
  const typestring = pick_best_io_type(io.type);
  console.log("typestring", typestring);

  let OutputhandlePreview = typestring
    ? window.funcnodes?.globals?.outputrenderer?.GlobalOutputrenderer?.[
        typestring
      ]
    : undefined;

  console.log("tyepstring", typestring, "OutputhandlePreview", render.typemap);
  if (OutputhandlePreview === undefined && typestring !== undefined) {
    if (render.typemap?.[typestring] !== undefined) {
      OutputhandlePreview =
        window.funcnodes?.globals?.outputrenderer?.GlobalOutputrenderer?.[
          render.typemap[typestring]
        ];
    }
  }

  return (
    <div className="nodeoutput">
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Right}
        preview={OutputhandlePreview}
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
