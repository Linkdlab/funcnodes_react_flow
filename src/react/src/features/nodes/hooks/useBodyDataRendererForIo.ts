import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "@/barrel_imports";
import { useFuncNodesContext } from "@/providers";
import { pick_best_io_type } from "../components/node-renderer/io/io";
import { latest } from "@/barrel_imports";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererToDataPreviewViewRenderer,
  FallbackDataViewRenderer,
  useDataOverlayRendererForIo,
} from "@/data-rendering";
import { RenderMappingContext } from "@/data-rendering";

const useBodyDataRendererForIo = (
  io?: latest.IOType
): [
  DataPreviewViewRendererType | undefined,
  DataOverlayRendererType | undefined
] => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const overlayhandle = useDataOverlayRendererForIo(io);
  const { DataPreviewViewRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  const render: RenderOptions = fnrf_zst.render_options();

  if (io === undefined) return [undefined, overlayhandle];

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

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
