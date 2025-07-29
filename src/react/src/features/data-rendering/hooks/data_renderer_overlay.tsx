import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
  latest,
} from "@/barrel_imports";

import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "@/nodes";
import { RenderMappingContext } from "../providers";
import {
  DataOverlayRendererType,
  FallbackOverlayRenderer,
} from "../components";
import { DataViewRendererToOverlayRenderer } from "../utils";

export const useDataOverlayRendererForIo = (
  io?: latest.IOType
): DataOverlayRendererType | undefined => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const { DataOverlayRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  if (io === undefined) return undefined;
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring) return FallbackOverlayRenderer;

  if (DataOverlayRenderer[typestring]) return DataOverlayRenderer[typestring];

  if (DataViewRenderer[typestring])
    return DataViewRendererToOverlayRenderer(DataViewRenderer[typestring]);

  return FallbackOverlayRenderer;
};
