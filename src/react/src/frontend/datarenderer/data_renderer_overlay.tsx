import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
  latest,
} from "@/barrel_imports";
import { pick_best_io_type } from "../node/io/io";
import { RenderMappingContext } from "./rendermappings";
import {
  DataViewRendererToOverlayRenderer,
  DefaultOverlayRenderer,
} from "./default_data_overlay_views";
import { useFuncNodesContext } from "@/providers";

const useDataOverlayRendererForIo = (
  io?: latest.IOType
): latest.DataOverlayRendererType | undefined => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const { DataOverlayRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  if (io === undefined) return undefined;
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring) return DefaultOverlayRenderer;

  if (DataOverlayRenderer[typestring]) return DataOverlayRenderer[typestring];

  if (DataViewRenderer[typestring])
    return DataViewRendererToOverlayRenderer(DataViewRenderer[typestring]);

  return DefaultOverlayRenderer;
};

export { useDataOverlayRendererForIo };
