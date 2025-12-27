import { useContext } from "react";
import { RenderOptions } from "@/data-rendering-types";
import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "../pick_best_io_type";
import {
  DataViewRendererToDataPreviewViewRenderer,
  FallbackDataViewRenderer,
  useDataOverlayRendererForIo,
  RenderMappingContext,
} from "@/data-rendering";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
} from "@/data-rendering-types";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { IOType } from "@/nodes-core";

const useBodyDataRendererForIo = (
  io?: IOType
): [
  DataPreviewViewRendererType | undefined,
  DataOverlayRendererType | undefined
] => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const overlayhandle = useDataOverlayRendererForIo(io);
  const { DataPreviewViewRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  const render: RenderOptions = fnrf_zst.render_options();

  if (io === undefined) return [undefined, overlayhandle];

  const [typestring] = pick_best_io_type(io, render.typemap || {});

  if (!typestring)
    return [
      DataViewRendererToDataPreviewViewRenderer(FallbackDataViewRenderer),
      overlayhandle,
    ];

  if (DataPreviewViewRenderer[typestring])
    return [DataPreviewViewRenderer[typestring], overlayhandle];

  if (DataViewRenderer[typestring])
    return [
      DataViewRendererToDataPreviewViewRenderer(DataViewRenderer[typestring]),
      overlayhandle,
    ];

  return [
    DataViewRendererToDataPreviewViewRenderer(FallbackDataViewRenderer),
    overlayhandle,
  ];
};

export { useBodyDataRendererForIo };
