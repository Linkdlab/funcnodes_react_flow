import { useContext } from "react";
import { useFuncNodesContext } from "@/providers";
import { Position } from "@xyflow/react";
import { RenderOptions } from "@/data-rendering-types";
import { HandleWithPreview, pick_best_io_type } from "./io";

import * as React from "react";
import { RenderMappingContext, SelectionInput } from "@/data-rendering";
import { useKeyPress } from "@/providers";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { useIOStore } from "@/nodes";

const INPUTCONVERTER: {
  [key: string]: [(v: any) => any, (v: any) => any] | undefined;
} = {
  "": [(v: any) => v, (v: any) => v],
  str_to_json: [
    (v: any) => {
      return JSON.parse(v);
    },
    (v: any) => {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    },
  ],
  str_to_list: [
    (v: any) => {
      try {
        const a = JSON.parse(v);
        if (Array.isArray(a)) return a;
        return [a];
      } catch (e) {
        try {
          return JSON.parse("[" + v + "]");
        } catch (e) {}
      }

      throw new Error("Invalid list");
    },
    (v: any) => JSON.stringify(v),
  ],
};

const NodeInput = ({
  setNodeSettingsPath,
  setShowSettings,
}: {
  setNodeSettingsPath?: (path: string) => void;
  setShowSettings?: (show: boolean) => void;
}) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const render: RenderOptions = fnrf_zst.render_options();

  const io_store = useIOStore();
  const io = io_store.use();

  const [typestring, otypestring] = pick_best_io_type(io, render.typemap || {});

  const { Inputrenderer } = useContext(RenderMappingContext);

  const Input = typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[typestring]
    : undefined;

  const inputconverterf: [(v: any) => any, (v: any) => any] =
    INPUTCONVERTER[
      (otypestring && render.inputconverter?.[otypestring]) ?? ""
    ] || INPUTCONVERTER[""]!;
  const { keys: pressedKeys } = useKeyPress();
  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pressedKeys.has("s")) {
      if (setNodeSettingsPath) setNodeSettingsPath("inputs/" + io.id);
      if (setShowSettings) setShowSettings(true);
      e.stopPropagation();
    }
  };

  if (io.hidden) return null;
  return (
    <div
      className="nodeinput"
      {...{ "data-type": typestring }}
      onClick={onClickHandler}
    >
      <HandleWithPreview
        typestring={typestring}
        position={Position.Left}
        type="target"
      />
      <div className="inner_nodeio">
        {Input && (
          <div className="iovaluefield nodrag" {...{ "data-type": typestring }}>
            <Input inputconverter={inputconverterf} />
          </div>
        )}
        <div className="ioname">{io.name}</div>
      </div>
      <HandleWithPreview
        typestring={typestring}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

export default NodeInput;
export { INPUTCONVERTER };
