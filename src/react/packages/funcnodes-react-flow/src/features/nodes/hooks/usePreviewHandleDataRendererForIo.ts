import { useContext } from "react";
import { RenderOptions } from "@/data-rendering-types";
import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "../pick_best_io_type";
import {
  DataViewRendererToDataPreviewViewRenderer,
  RenderMappingContext,
  useDataOverlayRendererForIo,
  FallbackDataViewRenderer,
} from "@/data-rendering";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
} from "@/data-rendering-types";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { IOType } from "@/nodes-core";

const usePreviewHandleDataRendererForIo = (
  io?: IOType
): [
  DataPreviewViewRendererType | undefined,
  DataOverlayRendererType | undefined
] => {
  // Always call hooks at the top
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();
  const { HandlePreviewRenderer, DataPreviewViewRenderer } =
    useContext(RenderMappingContext);

  const overlayhandle: DataOverlayRendererType | undefined =
    useDataOverlayRendererForIo(io);

  // Prepare default values
  let previewRenderer: DataPreviewViewRendererType | undefined = undefined;

  // If io is defined, calculate the renderers; otherwise, keep them as undefined.
  if (io) {
    const [typestring] = pick_best_io_type(io, render.typemap || {});

    if (!typestring) {
      previewRenderer = DataViewRendererToDataPreviewViewRenderer(
        FallbackDataViewRenderer
      );
    } else if (HandlePreviewRenderer[typestring]) {
      previewRenderer = HandlePreviewRenderer[typestring];
    } else if (DataPreviewViewRenderer[typestring]) {
      previewRenderer = DataPreviewViewRenderer[typestring];
    } else {
      previewRenderer = DataViewRendererToDataPreviewViewRenderer(
        FallbackDataViewRenderer
      );
    }
  }

  return [previewRenderer, overlayhandle];
};

export { usePreviewHandleDataRendererForIo };
