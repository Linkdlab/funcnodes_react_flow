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

const DataOverlayRendererForIo = (
  io: IOType
): (({ io }: { io: IOType }) => JSX.Element) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring) return DictOutput;

  const { DataOverlayRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  if (DataOverlayRenderer[typestring]) return DataOverlayRenderer[typestring];

  if (DataPreviewViewRenderer[typestring])
    return DataPreviewViewRenderer[typestring];

  return DictOutput;
};

export { DataOverlayRendererForIo };
