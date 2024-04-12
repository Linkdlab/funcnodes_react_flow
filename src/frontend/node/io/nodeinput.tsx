import { useContext, useEffect, useRef, useState } from "react";
import { FuncNodesContext } from "../..";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Handle, Position } from "reactflow";
import { FuncNodesReactFlowZustandInterface } from "../../../state/fnrfzst";
import { HandleWithPreview, pick_best_io_type } from "./io";
import {
  BooleanInput,
  FloatInput,
  IntegerInput,
  StringInput,
  SelectionInput,
  ColorInput,
} from "./default_input_renderer";
import { SingleValueOutput } from "./default_output_render";

const Inputrenderer: {
  [key: string]: InputRendererType;
} = {};

const register_input_renderer = (type: string, renderer: InputRendererType) => {
  Inputrenderer[type] = renderer;
};

register_input_renderer("float", FloatInput);
register_input_renderer("int", IntegerInput);
register_input_renderer("bool", BooleanInput);
register_input_renderer("string", StringInput);
register_input_renderer("str", StringInput);
register_input_renderer("color", ColorInput);
register_input_renderer("select", SelectionInput);
register_input_renderer("enum", SelectionInput);

const INPUTCONVERTER: {
  [key: string]: (v: any) => any;
} = {
  "": (v: any) => v,
  str_to_json: (v: any) => {
    return JSON.parse(v);
  },
  str_to_list: (v: any) => {
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
};

const NodeInput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const render: RenderOptions = fnrf_zst.render_options();

  if (io.render_options === undefined) {
    io.render_options = {};
  }
  if (io.render_options.set_default === undefined) {
    io.render_options.set_default = true;
  }

  const [typestring, otypestring] = pick_best_io_type(
    io.type,
    render.typemap || {}
  );

  console.log([
    "typestring",
    typestring,
    otypestring,
    otypestring && render.inputconverter?.[otypestring],
  ]);

  const InputHandlePreview =
    (typestring
      ? window.funcnodes?.globals?.outputrenderer?.GlobalOutputrenderer?.[
          typestring
        ]
      : SingleValueOutput) || SingleValueOutput;

  const Input = typestring
    ? io.value_options?.options
      ? SelectionInput
      : Inputrenderer[typestring]
    : undefined;
  const inputconverterf: (v: any) => any =
    INPUTCONVERTER[(otypestring && render.inputconverter?.[otypestring]) ?? ""];
  return (
    <div className="nodeinput">
      <HandleWithPreview
        io={io}
        typestring={typestring}
        position={Position.Left}
        preview={InputHandlePreview}
        type="target"
      />

      {Input && (
        <div className="iovaluefield nodrag">
          <Input io={io} inputconverter={inputconverterf} />
        </div>
      )}
      <div className="ioname">{io.name}</div>
    </div>
  );
};

export default NodeInput;

type Renderotion = ({ text }: { text: string }) => JSX.Element;

const renderoptions: { [key: string]: Renderotion } = {};

const Renderer = () => {
  const [text, setText] = useState("");
  const [render, setRender] = useState<Renderotion | undefined>(undefined);

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select onChange={(e) => setRender(renderoptions[e.target.value])}>
        {Object.keys(renderoptions).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      {render && render({ text })}
    </div>
  );
};
