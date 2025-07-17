import { useContext } from "react";

import { Position } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";

import { HandleWithPreview, pick_best_io_type } from "./io";

import {
  RenderOptions,
  FuncNodesReactFlowZustandInterface,
} from "../../../states/fnrfzst.t";

import * as React from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";
import { latest } from "../../../types/versioned/versions.t";
import { InLineOutput } from "../../datarenderer/default_output_renderer";
import { useKeysDown } from "../../utils/keypresslistener";

const NodeOutput = ({
  iostore,
  setNodeSettingsPath,
  setShowSettings,
}: {
  iostore: latest.IOStore;
  setNodeSettingsPath?: (path: string) => void;
  setShowSettings?: (show: boolean) => void;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();

  const io = iostore.use();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});
  const { Outputrenderer } = useContext(RenderMappingContext);
  const pressedKeys = useKeysDown();
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
