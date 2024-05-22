import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../../states/fnrfzst.t";
import { FuncNodesContext } from "../../funcnodesreactflow";
import { pick_best_io_type } from "./io";
import { IOType } from "../../../states/nodeio.t";

import { DataOverlayRendererForIo } from "../../datarenderer/data_renderer_overlay";

import { RenderMappingContext } from "../../datarenderer/rendermappings";
import { DictOutput } from "../../datarenderer/default_preview_renderer";

const PreviewHandleDataRendererForIo = (
  io: IOType
): [
  ({ io }: { io: IOType }) => JSX.Element,
  ({ io }: { io: IOType }) => JSX.Element,
] => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  const { HandlePreviewRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  const overlayhandle = DataOverlayRendererForIo(io);

  if (!typestring) return [DictOutput, overlayhandle];

  if (HandlePreviewRenderer[typestring])
    return [HandlePreviewRenderer[typestring], overlayhandle];

  if (DataPreviewViewRenderer[typestring])
    return [DataPreviewViewRenderer[typestring], overlayhandle];

  // console.warn(
  //   "No preview generator found for type: ",
  //   typestring,
  //   "have: ",
  //   DataPreviewViewRenderer
  // );

  return [DictOutput, overlayhandle];
};

export { PreviewHandleDataRendererForIo };
