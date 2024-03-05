import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Handle, Position, NodeResizeControl } from "reactflow";
import { NodeStore, NodeType, IOType, RenderType } from "../state/node";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandIcon from "@mui/icons-material/Expand";
import LanIcon from "@mui/icons-material/Lan";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import "./node.scss";
import { FuncNodesReactFlowZustandInterface } from "../state/fnrfzst";
import { FuncNodesContext } from ".";
import get_rendertype from "./datarenderer";
import CustomColorPicker, { HSLColorPicker } from "./utils/colorpicker";

interface NodeHeaderProps {
  node_data: NodeType;
}

const NodeHeader = ({ node_data }: NodeHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const clicktrigger = () => {
    fnrf_zst.on_node_action({
      type: "trigger",
      from_remote: false,
      id: node_data.id,
    });
  };

  return (
    <div className="nodeheader">
      <div className="nodeheader_element">
        <PlayCircleFilledIcon
          fontSize="inherit"
          className="triggerbutton"
          onClick={clicktrigger}
        />
        <LanIcon fontSize="inherit" />
      </div>
      <div className="nodeheader_element nodeheader_title">
        <div className="nodeheader_title_text">{node_data.node_name}</div>
      </div>
      <div className="nodeheader_element">
        <ExpandLessIcon fontSize="inherit" />
      </div>
    </div>
  );
};

interface NodeBodyProps {
  node_data: NodeType;
}

const BooleanInput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const indeterminate = io.value === undefined;
  const cRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cRef.current) return;
    cRef.current.indeterminate = indeterminate;
  }, [cRef, indeterminate]);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: e.target.checked,
      set_default: io.render_options?.set_default || false,
    });
  };
  return (
    <input
      ref={cRef}
      type="checkbox"
      checked={!!io.value}
      onChange={on_change}
      disabled={io.connected}
    />
  );
};
const NumberInput = ({
  io,
  parser = (n: string) => parseFloat(n),
}: {
  io: IOType;
  parser: (n: string) => number;
}) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: number | string = parser(e.target.value);
    if (isNaN(new_value)) {
      new_value = "<NoValue>";
    }

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <input
      type="number"
      className="nodedatainput"
      value={io.value}
      onChange={on_change}
      disabled={io.connected}
      step={io.render_options?.step}
      min={io.value_options?.min}
    />
  );
};

const StringInput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: string = e.target.value;
    if (!new_value) new_value = "<NoValue>";

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <input
      className="nodedatainput"
      value={io.value}
      onChange={on_change}
      disabled={io.connected}
    />
  );
};

const ColorInput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const colorspace = io.value_options?.colorspace || "hex";

  const on_change = (colorconverter?: {
    [key: string]: () => number[] | string;
  }) => {
    let new_value: string | number[] = "<NoValue>";
    if (colorconverter) {
      if (colorconverter[colorspace]) new_value = colorconverter[colorspace]();
      else new_value = colorconverter.hex();
    }

    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: new_value,
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <CustomColorPicker
      onChange={on_change}
      inicolordata={io.value}
      inicolorspace={colorspace}
    />
  );
};

const _SelectionInput = ({
  io,
  parser = (x) => x,
}: {
  io: IOType;
  parser(s: string): any;
}) => {
  const options: (string | number)[] = io.value_options?.options || [];
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const on_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    fnrf_zst.worker?.set_io_value({
      nid: io.node,
      ioid: io.id,
      value: parser(e.target.value),
      set_default: io.render_options?.set_default || false,
    });
  };

  return (
    <select
      value={io.value}
      onChange={on_change}
      disabled={io.connected}
      className="nodedatainput"
    >
      <option value="<NoValue>" disabled>
        select
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const SingleValueOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  return <div>{JSON.stringify(io.value)}</div>;
};

const FloatInput = ({ io }: { io: IOType }) => {
  return NumberInput({ io, parser: parseFloat });
};

const IntegerInput = ({ io }: { io: IOType }) => {
  return NumberInput({ io, parser: parseInt });
};

const Outputrenderer: { [key: string]: any } = {
  float: SingleValueOutput,
  bool: SingleValueOutput,
  int: SingleValueOutput,
  string: SingleValueOutput,
};

const SelectionInput: { [key: string]: any } = {
  float: ({ io }: { io: IOType }) =>
    _SelectionInput({ io, parser: parseFloat }),
  bool: ({ io }: { io: IOType }) => _SelectionInput({ io, parser: (x) => !!x }),
  int: ({ io }: { io: IOType }) => _SelectionInput({ io, parser: parseInt }),
  str: _SelectionInput,
};

const Inputrenderer: { [key: string]: any } = {
  float: FloatInput,
  int: IntegerInput,
  bool: BooleanInput,
  string: StringInput,
  color: ColorInput,
  select: SelectionInput["str"],
};

const NodeInput = ({ io }: { io: IOType }) => {
  if (io.render_options === undefined) {
    io.render_options = {};
  }
  if (io.render_options.set_default === undefined) {
    io.render_options.set_default = true;
  }
  const Input = io.value_options?.options
    ? SelectionInput[io.type]
    : Inputrenderer[io.type];

  return (
    <div className="nodeinput">
      <Handle type="target" id={io.id} position={Position.Left} />

      {Input && (
        <div className="iovaluefield nodrag">
          <Input io={io} />
        </div>
      )}
      <div className="ioname">{io.name}</div>
    </div>
  );
};

const NodeOutput = ({ io }: { io: IOType }) => {
  const Output = Outputrenderer[io.type];
  return (
    <div className="nodeoutput">
      <Handle type="source" id={io.id} position={Position.Right} />
      <div className="ioname">{io.name}</div>
      {Output && (
        <div className="iovaluefield">
          <Output io={io} />
        </div>
      )}
    </div>
  );
};

const NodeDataRenderer = ({ node_data }: { node_data: NodeType }) => {
  let value: any = undefined;
  let rendertype: RenderType = "string";
  if (node_data.render_options?.data?.src) {
    value = node_data.io[node_data.render_options.data.src]?.value;
    rendertype =
      (node_data.render_options?.data?.preview_type as RenderType) ||
      (node_data.io[node_data.render_options.data.src]
        ?.valuepreview_type as RenderType) ||
      (node_data.render_options?.data?.type as RenderType) ||
      (node_data.io[node_data.render_options.data.src]?.type as RenderType) ||
      "string";
  }

  if (value === "<NoValue>") value = undefined;

  const renderoptions = node_data.render_options?.data;

  const datarender = useMemo(() => {
    if (value === undefined) {
      return <></>;
    }
    return get_rendertype(rendertype)({
      value,
      renderoptions: renderoptions,
    });
  }, [value, renderoptions]);

  return <div className="nodedatabody nodrag">{datarender}</div>;
};
const NodeBody = ({ node_data }: NodeBodyProps) => {
  const inputs = Object.values(node_data.io).filter((io) => io.is_input);
  const outputs = Object.values(node_data.io).filter((io) => !io.is_input);

  if (node_data.render_options?.data?.src) {
  }

  return (
    <div className="nodebody">
      {outputs.map((io) => (
        <NodeOutput key={io.id} io={io} />
      ))}
      <NodeDataRenderer node_data={node_data} />
      {inputs.map((io) => (
        <NodeInput key={io.id} io={io} />
      ))}
    </div>
  );
};

const NodeName = ({ node_data }: { node_data: NodeType }) => {
  const [name, setName] = useState(node_data.name);

  useEffect(() => {
    setName(node_data.name);
  }, [node_data]);

  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const finalSetName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const new_name = e.target.value;
    fnrf_zst.on_node_action({
      type: "update",
      from_remote: false,
      id: node_data.id,
      node: { name: new_name },
    });
  };
  return (
    <input
      className="nodename_input"
      value={name}
      onChange={handleChange}
      onBlur={finalSetName}
    />
  );
};

const NodeFooter = ({ node_data }: { node_data: NodeType }) => {
  return (
    <div className="nodefooter">
      {node_data.error && <div className="nodeerror">{node_data.error}</div>}
    </div>
  );
};
/**
 * A generic function to deeply merge two objects of type T.
 *
 * @param {T} target - The target object to be merged.
 * @param {DeepPartial<T>} source - The source object to merge into the target. All properties of this object are optional.
 *
 * @returns {Object} An object containing the merged object (new_obj) and a boolean indicating if there was a change (change).
 *
 * @throws {Type 'string' cannot be used to index type 'T'} This error is ignored using the @ts-ignore directive because we are dynamically accessing properties of a generic type T.
 */
const DefaultNode = ({ data }: { data: { UseNodeStore: NodeStore } }) => {
  // Use the NodeStore to get the data for the node.
  const storedata = data.UseNodeStore();

  const collapsed = storedata.frontend.collapsed || true;

  const [visualTrigger, setVisualTrigger] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // When in_trigger becomes true, set visualTrigger to true immediately
    if (storedata.in_trigger) {
      setVisualTrigger(true);
    } else if (visualTrigger) {
      // When in_trigger becomes false, wait for a minimum duration before setting visualTrigger to false
      timeoutId = setTimeout(() => setVisualTrigger(false), 200); // 50ms or any other duration you see fit
    }

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount or state changes
  }, [storedata.in_trigger, visualTrigger]);

  return (
    <>
      {/* <NodeResizeControl
        minWidth={100}
        minHeight={100}
        className="noderesizecontrol"
      >
        <ExpandIcon fontSize="inherit" className="noderesizeicon" />
      </NodeResizeControl> */}
      <div
        className={
          "innernode" +
          (visualTrigger ? " intrigger" : "") +
          (storedata.error ? " error" : "")
        }
      >
        <NodeHeader node_data={storedata} />
        <NodeName node_data={storedata} />
        <NodeBody node_data={storedata} />
        <NodeFooter node_data={storedata} />
      </div>
    </>
  );
};

export default DefaultNode;
export {};
