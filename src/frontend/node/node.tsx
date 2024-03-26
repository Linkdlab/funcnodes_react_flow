import React, {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { NodeStore, RenderType } from "../../state/node";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandIcon from "@mui/icons-material/Expand";
import LanIcon from "@mui/icons-material/Lan";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import "./node.scss";
import { FuncNodesReactFlowZustandInterface } from "../../state/fnrfzst";
import { FuncNodesContext } from "..";
import get_rendertype from "../datarenderer";
import CustomColorPicker, { HSLColorPicker } from "../utils/colorpicker";
import { NodeInput, NodeOutput } from "./io";

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

const NodeDataRenderer = ({ node_data }: { node_data: NodeType }) => {
  let value: any = undefined;
  let rendertype: RenderType = "string";
  const src = node_data.render_options?.data?.src;
  if (src) {
    value = node_data.io[src]?.value;
    //    console.log("src", node_data.io[src]);
    rendertype =
      (node_data.render_options?.data?.preview_type as RenderType) ||
      (node_data.io[src]?.valuepreview_type as RenderType) ||
      (node_data.render_options?.data?.type as RenderType) ||
      (node_data.io[src]?.type as RenderType) ||
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