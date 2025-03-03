import * as React from "react";
import { useContext, useEffect, useState } from "react";

import { NodeStore, NodeType } from "../../states/node.t";

import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { NodeInput, NodeOutput } from "./io";

import CustomDialog from "../dialog";
import { IOType } from "../../states/nodeio.t";
import { useBodyDataRendererForIo } from "./body_data_renderer";
import { DynamicComponentLoader } from "../datarenderer/rendermappings";
import ProgressBar from "../utils/progressbar";
import { PlayCircleFilledIcon, LanIcon } from "../assets/fontawsome";
import { ExpandLessIcon } from "../assets/fontawsome";

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
    <div
      className="nodeheader"
      title={node_data.description || node_data.node_name}
    >
      <div className="nodeheader_element">
        <PlayCircleFilledIcon
          fontSize="inherit"
          className="triggerbutton"
          onClick={clicktrigger}
        />
        <LanIcon
          fontSize="inherit"
          onClick={async () => {
            fnrf_zst.logger.info(
              "nodestatus",
              await fnrf_zst.worker?.get_node_status(node_data.id)
            );
          }}
        />
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
  const io: IOType | undefined = node_data.render_options?.data?.src
    ? node_data.io[node_data.render_options?.data?.src]
    : undefined;

  const [pvhandle, overlayhandle] = useBodyDataRendererForIo(io);

  return (
    <div
      className="nodrag nodedatabody"
      data-src={node_data.render_options?.data?.src || ""}
    >
      {pvhandle && io && (
        <CustomDialog
          title={io.full_id}
          trigger={
            <div className="nodedatabutton">
              {<DynamicComponentLoader component={pvhandle} io={io} />}
            </div>
          }
          onOpenChange={(open: boolean) => {
            if (open) {
              if (io?.try_get_full_value) io?.try_get_full_value();
            }
          }}
        >
          {overlayhandle && (
            <DynamicComponentLoader component={overlayhandle} io={io} />
          )}
        </CustomDialog>
      )}
    </div>
  );
};

const NodeBody = ({ node_data }: NodeBodyProps) => {
  const inputs = Object.values(node_data.io).filter((io) => io.is_input);
  const outputs = Object.values(node_data.io).filter((io) => !io.is_input);

  if (node_data.render_options?.data?.src) {
  }

  return (
    <div className="nodebody">
      {outputs.map((io) => {
        if (io.hidden) return null;
        return <NodeOutput key={io.id} io={io} />;
      })}
      <NodeDataRenderer node_data={node_data} />
      {inputs.map((io) => {
        if (io.hidden) return null;
        return <NodeInput key={io.id} io={io} />;
      })}
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

const NodeProgressBar = ({ node_data }: { node_data: NodeType }) => {
  if (!node_data.progress) return null;

  return (
    <ProgressBar
      style={{
        height: node_data.progress.prefix === "idle" ? "0px" : undefined,
      }}
      state={node_data.progress}
      className="nodeprogress"
    ></ProgressBar>
  );
};

const NodeFooter = ({ node_data }: { node_data: NodeType }) => {
  return (
    <div className="nodefooter">
      {node_data.error && <div className="nodeerror">{node_data.error}</div>}
      <NodeProgressBar node_data={node_data} />
    </div>
  );
};

export const useDefaultNodeInjection = (storedata: NodeType) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const [visualTrigger, setVisualTrigger] = useState(false);

  // Call a hook when the node is mounted.
  useEffect(() => {
    fnrf_zst.worker?.call_hooks("node_mounted", storedata.id);
  }, [fnrf_zst.worker, storedata.id]);

  // Manage visual trigger state based on the node's in_trigger flag.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (storedata.in_trigger && !visualTrigger) {
      setVisualTrigger(true);
    } else if (visualTrigger) {
      timeoutId = setTimeout(() => setVisualTrigger(false), 200);
    }
    return () => clearTimeout(timeoutId);
  }, [storedata.in_trigger, visualTrigger]);

  return { visualTrigger };
};

const DefaultNode = ({ data }: { data: { UseNodeStore: NodeStore } }) => {
  // Use the NodeStore to get the data for the node.
  const storedata = data.UseNodeStore();

  const collapsed = storedata.properties["frontend:collapsed"] || false;

  const { visualTrigger } = useDefaultNodeInjection(storedata);

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
        {collapsed ? null : <NodeBody node_data={storedata} />}
        <NodeFooter node_data={storedata} />
      </div>
    </>
  );
};

export default DefaultNode;
export { NodeName };
