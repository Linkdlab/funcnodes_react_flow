import { JSX, useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../states/fnrfzst.t";
import { IOStore, IOType } from "../../states/nodeio.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { pick_best_io_type } from "./io/io";

import { useDataOverlayRendererForIo } from "../datarenderer/data_renderer_overlay";

import { RenderMappingContext } from "../datarenderer/rendermappings";
import { DictOutput } from "../datarenderer/default_preview_renderer";

const useBodyDataRendererForIo = (
  io?: IOType
): [
  (({ iostore }: { iostore: IOStore }) => JSX.Element) | undefined,
  (({ iostore }: { iostore: IOStore }) => JSX.Element) | undefined
] => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const overlayhandle = useDataOverlayRendererForIo(io);
  const { DataPreviewViewRenderer, DataViewRenderer } =
    useContext(RenderMappingContext);

  const render: RenderOptions = fnrf_zst.render_options();

  if (io === undefined) return [undefined, overlayhandle];

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  if (!typestring) return [DictOutput, overlayhandle];

  if (DataViewRenderer[typestring])
    return [DataViewRenderer[typestring], overlayhandle];

  if (DataPreviewViewRenderer[typestring])
    return [DataPreviewViewRenderer[typestring], overlayhandle];

  return [DictOutput, overlayhandle];
};

export { useBodyDataRendererForIo };
