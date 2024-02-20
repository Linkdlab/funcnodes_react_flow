import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Handle, Position, NodeResizeControl } from "reactflow";
import { NodeStore, NodeType, IOType } from "../state/node";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LanIcon from "@mui/icons-material/Lan";
import ExpandIcon from "@mui/icons-material/Expand";
import "./node.scss";
import { FuncNodesReactFlowZustandInterface } from "../state/fnrfzst";
import { FuncNodesContext } from ".";

interface NodeHeaderProps {
  node_data: NodeType;
}
const NodeHeader = ({ node_data }: NodeHeaderProps) => {
  return (
    <div className="nodeheader">
      <div className="nodeheader_element">
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

const FloatInput = ({ io }: { io: IOType }) => {
  const [value, setValue] = useState(io.value);
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let new_value: number | string = parseFloat(e.target.value);
    if (isNaN(new_value)) {
      new_value = "<NoValue>";
    }

    fnrf_zst.worker
      ?.set_io_value({
        nid: io.node,
        ioid: io.id,
        value: new_value,
        set_default: true,
        trigger: true,
      })
      .then((resp) => {
        setValue(resp);
      });
  };

  return (
    <input
      type="number"
      className="floatinput"
      value={value}
      onChange={on_change}
      disabled={io.connected}
    />
  );
};

const SingleValueOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  return <div>{io.value}</div>;
};

const Inputrenderer: { [key: string]: any } = {
  float: FloatInput,
};

const Outputrenderer: { [key: string]: any } = {
  float: SingleValueOutput,
};

const NodeInput = ({ io }: { io: IOType }) => {
  const Input = Inputrenderer[io.type];

  return (
    <div className="nodeinput">
      <Handle type="target" id={io.id} position={Position.Left} />

      {Input && (
        <div className="iovaluefield">
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

const NodeBody = ({ node_data }: NodeBodyProps) => {
  const inputs = Object.values(node_data.io).filter((io) => io.is_input);
  const outputs = Object.values(node_data.io).filter((io) => !io.is_input);

  return (
    <div className="nodebody">
      {outputs.map((io) => (
        <NodeOutput key={io.id} io={io} />
      ))}
      <div className="nodedatabody"></div>
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
      <div className={"innernode" + (visualTrigger ? " intrigger" : "")}>
        <NodeHeader node_data={storedata} />
        <NodeName node_data={storedata} />
        <NodeBody node_data={storedata} />

        <div className="nodefooter">Footer</div>
      </div>
    </>
  );
};

export default DefaultNode;
export {};
