import { JSX, useContext } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  RenderOptions,
} from "../../states/fnrfzst.t";
import { IOStore, IOType } from "../../states/nodeio.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { pick_best_io_type } from "../node/io/io";

import { RenderMappingContext } from "./rendermappings";
import { DictOutput } from "./default_preview_renderer";

const DataPreviewRendererForIo = (
  io: IOType
): (({ iostore }: { iostore: IOStore }) => JSX.Element) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  const [typestring] = pick_best_io_type(io.type, render.typemap || {});

  const { DataPreviewViewRenderer } = useContext(RenderMappingContext);

  if (!typestring) return DictOutput;

  if (DataPreviewViewRenderer[typestring])
    return DataPreviewViewRenderer[typestring];

  return DictOutput;
};

export { DataPreviewRendererForIo };
