import { useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { pick_best_io_type } from "./io/io";

import { useDataOverlayRendererForIo } from "../datarenderer/data_renderer_overlay";

import { RenderMappingContext } from "../datarenderer/rendermappings";
import { DefaultDataView } from "../datarenderer/default_data_view_renderer";
import { latest } from "../../types/versioned/versions.t";
import { DataViewRendererToDataPreviewViewRenderer } from "../datarenderer/default_data_preview_renderer";

const useBodyDataRendererForIo = (
  io?: latest.IOType
): [
  latest.DataPreviewViewRendererType | undefined,
  latest.DataOverlayRendererType | undefined
] => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const overlayhandle = useDataOverlayRendererForIo(io);
  const { DataPreviewViewRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  const render: RenderOptions = fnrf_zst.render_options();

  if (io === undefined) return [undefined, overlayhandle];

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring)
    return [
      DataViewRendererToDataPreviewViewRenderer(DefaultDataView),
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
    DataViewRendererToDataPreviewViewRenderer(DefaultDataView),
    overlayhandle,
  ];
};

export { useBodyDataRendererForIo };
