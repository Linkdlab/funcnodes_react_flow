import { JSX, useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../states/fnrfzst.t";
import { IOType } from "../../states/nodeio.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { pick_best_io_type } from "./io/io";

import { DataOverlayRendererForIo } from "../datarenderer/data_renderer_overlay";

import { RenderMappingContext } from "../datarenderer/rendermappings";
import { DictOutput } from "../datarenderer/default_preview_renderer";

const BodyDataRendererForIo = (
  io: IOType
): [
  ({ io }: { io: IOType }) => JSX.Element,
  ({ io }: { io: IOType }) => JSX.Element
] => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  const overlayhandle = DataOverlayRendererForIo(io);

  const { DataPreviewViewRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  if (!typestring) return [DictOutput, overlayhandle];

  if (DataViewRenderer[typestring])
    return [DataViewRenderer[typestring], overlayhandle];

  if (DataPreviewViewRenderer[typestring])
    return [DataPreviewViewRenderer[typestring], overlayhandle];

  return [DictOutput, overlayhandle];
};

export { BodyDataRendererForIo };
