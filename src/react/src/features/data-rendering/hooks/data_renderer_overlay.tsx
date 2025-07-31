import { useContext } from "react";
import { RenderOptions } from "@/data-rendering-types";

import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "@/nodes";
import { RenderMappingContext } from "../providers";
import { FallbackOverlayRenderer } from "../components";
import { DataViewRendererToOverlayRenderer } from "../utils";
import { DataOverlayRendererType } from "../types";
import { IOType } from "@/nodes-core";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const useDataOverlayRendererForIo = (
  io?: IOType
): DataOverlayRendererType | undefined => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const { DataOverlayRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  if (io === undefined) return undefined;
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io, render.typemap || {});

  if (!typestring) return FallbackOverlayRenderer;

  if (DataOverlayRenderer[typestring]) return DataOverlayRenderer[typestring];

  if (DataViewRenderer[typestring])
    return DataViewRendererToOverlayRenderer(DataViewRenderer[typestring]);

  return FallbackOverlayRenderer;
};
