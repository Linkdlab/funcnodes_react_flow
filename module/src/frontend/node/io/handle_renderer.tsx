import { JSX, useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../../states/fnrfzst.t";
import { FuncNodesContext } from "../../funcnodesreactflow";
import { pick_best_io_type } from "./io";
import { IOType } from "../../../states/nodeio.t";

import { useDataOverlayRendererForIo } from "../../datarenderer/data_renderer_overlay";

import { RenderMappingContext } from "../../datarenderer/rendermappings";
import { DictOutput } from "../../datarenderer/default_preview_renderer";

const usePreviewHandleDataRendererForIo = (
  io?: IOType
): [
  (({ io }: { io: IOType }) => JSX.Element) | undefined,
  (({ io }: { io: IOType }) => JSX.Element) | undefined
] => {
  // Always call hooks at the top
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();
  const { HandlePreviewRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  const overlayhandle: (({ io }: { io: IOType }) => JSX.Element) | undefined =
    useDataOverlayRendererForIo(io);

  // Prepare default values
  let previewRenderer = undefined;

  // If io is defined, calculate the renderers; otherwise, keep them as undefined.
  if (io) {
    const [typestring] = pick_best_io_type(io.type, render.typemap || {});

    if (!typestring) {
      previewRenderer = DictOutput;
    } else if (HandlePreviewRenderer[typestring]) {
      previewRenderer = HandlePreviewRenderer[typestring];
    } else if (DataPreviewViewRenderer[typestring]) {
      previewRenderer = DataPreviewViewRenderer[typestring];
    } else {
      previewRenderer = DictOutput;
    }
  }

  return [previewRenderer, overlayhandle];
};

export { usePreviewHandleDataRendererForIo };
