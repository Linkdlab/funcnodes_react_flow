import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "@/barrel_imports";
import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "./io";

import { useDataOverlayRendererForIo } from "@/barrel_imports";

import { RenderMappingContext } from "@/barrel_imports";
import { DefaultDataView } from "@/barrel_imports";
import { latest } from "@/barrel_imports";
import { DataViewRendererToDataPreviewViewRenderer } from "@/barrel_imports";

const usePreviewHandleDataRendererForIo = (
  io?: latest.IOType
): [
  latest.DataPreviewViewRendererType | undefined,
  latest.DataOverlayRendererType | undefined
] => {
  // Always call hooks at the top
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();
  const { HandlePreviewRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  const overlayhandle: latest.DataOverlayRendererType | undefined =
    useDataOverlayRendererForIo(io);

  // Prepare default values
  let previewRenderer: latest.DataPreviewViewRendererType | undefined =
    undefined;

  // If io is defined, calculate the renderers; otherwise, keep them as undefined.
  if (io) {
    const [typestring] = pick_best_io_type(io.type, render.typemap || {});

    if (!typestring) {
      previewRenderer =
        DataViewRendererToDataPreviewViewRenderer(DefaultDataView);
    } else if (HandlePreviewRenderer[typestring]) {
      previewRenderer = HandlePreviewRenderer[typestring];
    } else if (DataPreviewViewRenderer[typestring]) {
      previewRenderer = DataPreviewViewRenderer[typestring];
    } else {
      previewRenderer =
        DataViewRendererToDataPreviewViewRenderer(DefaultDataView);
    }
  }

  return [previewRenderer, overlayhandle];
};

export { usePreviewHandleDataRendererForIo };
