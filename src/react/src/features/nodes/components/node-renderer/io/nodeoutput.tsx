import { useContext } from "react";

import { Position } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";

import { HandleWithPreview, IOContext, pick_best_io_type } from "./io";

import * as React from "react";
import { useKeyPress } from "@/providers";
import { InLineOutput, RenderMappingContext } from "@/data-rendering";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { RenderOptions } from "@/data-rendering-types";

const NodeOutput = ({
  setNodeSettingsPath,
  setShowSettings,
}: {
  setNodeSettingsPath?: (path: string) => void;
  setShowSettings?: (show: boolean) => void;
}) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();

  const io_store = useContext(IOContext);
  const io = io_store.use();

  const [typestring] = pick_best_io_type(io, render.typemap || {});
  const { Outputrenderer } = useContext(RenderMappingContext);
  const { keys: pressedKeys } = useKeyPress();
  const Output = typestring ? Outputrenderer[typestring] : undefined;
  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pressedKeys.has("s")) {
      if (setNodeSettingsPath) setNodeSettingsPath("outputs/" + io.id);
      if (setShowSettings) setShowSettings(true);
      e.stopPropagation();
    }
  };

  if (io.hidden) {
    return null;
  }
  return (
    <div
      className="nodeoutput"
      {...{ "data-type": typestring }}
      onClick={onClickHandler}
    >
      <HandleWithPreview
        typestring={typestring}
        position={Position.Right}
        type="source"
      />
      <div className="inner_nodeio">
        <div className="ioname">{io.name}</div>
        {Output ? (
          <div className="iovaluefield nodrag">
            <Output iostore={io_store} />
          </div>
        ) : (
          <div className="iovaluefield">
            <InLineOutput iostore={io_store} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeOutput;
