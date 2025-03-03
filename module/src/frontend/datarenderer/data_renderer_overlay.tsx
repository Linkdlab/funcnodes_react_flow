import { JSX, useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../states/fnrfzst.t";
import { IOType } from "../../states/nodeio.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { pick_best_io_type } from "../node/io/io";

import { RenderMappingContext } from "./rendermappings";
import { DictOutput } from "./default_preview_renderer";

const useDataOverlayRendererForIo = (
  io?: IOType
): (({ io }: { io: IOType }) => JSX.Element) | undefined => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const { DataOverlayRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  if (io === undefined) return undefined;
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring) return DictOutput;

  if (DataOverlayRenderer[typestring]) return DataOverlayRenderer[typestring];

  if (DataPreviewViewRenderer[typestring])
    return DataPreviewViewRenderer[typestring];

  return DictOutput;
};

export { useDataOverlayRendererForIo };
