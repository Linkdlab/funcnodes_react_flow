import * as React from "react";
import { useContext, useEffect, useState } from "react";

import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";
import { NodeInput, NodeOutput } from "./io";

import CustomDialog from "../dialog";

import { useBodyDataRendererForIo } from "./body_data_renderer";
import { RenderMappingContext } from "../datarenderer/rendermappings";
import ProgressBar from "../utils/progressbar";
import { PlayCircleFilledIcon, LanIcon, GearIcon } from "../assets/fontawsome";
import { ExpandLessIcon } from "../assets/fontawsome";
import { latest } from "../../types/versioned/versions.t";
import { IODataOverlay, IOPreviewWrapper } from "./io/iodataoverlay";

interface NodeHeaderProps {
  node_data: latest.NodeType;
}

const NodeHeader = React.memo(({ node_data }: NodeHeaderProps) => {
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
          className="triggerbutton nodeheaderbutton"
          onClick={clicktrigger}
        />
        <LanIcon
          fontSize="inherit"
          className="nodestatusbutton nodeheaderbutton"
          onClick={async () => {
            console.log(
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
});

interface NodeBodyProps {
  node_data: latest.NodeType;
}

const NodeIODataRenderer = ({
  iostore,
  node_data,
}: {
  node_data: latest.NodeType;
  iostore: latest.IOStore;
}) => {
  const io = iostore.use();

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
              {<IOPreviewWrapper Component={pvhandle} iostore={iostore} />}
            </div>
          }
          onOpenChange={(open: boolean) => {
            if (open) {
              if (io?.try_get_full_value) io?.try_get_full_value();
            }
          }}
        >
          {overlayhandle && (
            <IODataOverlay Component={overlayhandle} iostore={iostore} />
          )}
        </CustomDialog>
      )}
    </div>
  );
};

const NodeBody = React.memo(({ node_data }: NodeBodyProps) => {
  const datarenderio = node_data.render_options?.data?.src
    ? node_data.io[node_data.render_options?.data?.src]
    : undefined;

  return (
    <div className="nodebody nowheel ">
      {node_data.outputs.map((ioname) => {
        return <NodeOutput key={ioname} iostore={node_data.io[ioname]!} />;
      })}
      {datarenderio && (
        <NodeIODataRenderer node_data={node_data} iostore={datarenderio} />
      )}
      {node_data.inputs.map((ioname) => {
        return <NodeInput key={ioname} iostore={node_data.io[ioname]!} />;
      })}
    </div>
  );
});

const NodeName = React.memo(({ node_data }: { node_data: latest.NodeType }) => {
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
});

const NodeProgressBar = ({ node_data }: { node_data: latest.NodeType }) => {
  if (!node_data.progress) return null;
  const progress = node_data.progress();
  return (
    <ProgressBar
      // style={{
      //   height: progress.prefix === "idle" ? "0px" : undefined,
      // }}
      state={progress}
      className="nodeprogress"
    ></ProgressBar>
  );
};

const NodeFooter = React.memo(
  ({ node_data }: { node_data: latest.NodeType }) => {
    return (
      <div className="nodefooter">
        {node_data.error && <div className="nodeerror">{node_data.error}</div>}
        <NodeProgressBar node_data={node_data} />
      </div>
    );
  }
);

export const useDefaultNodeInjection = (storedata: latest.NodeType) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const [visualTrigger, setVisualTrigger] = useState(false);
  const intrigger = storedata.in_trigger();

  const renderplugins = useContext(RenderMappingContext);

  // Memoize additionalContext so that it only recomputes when
  // either the extender function or storedata changes.
  const nodeContextExtender =
    renderplugins.NodeContextExtenders[storedata.node_id];
  const additionalContext = React.useMemo(
    () => nodeContextExtender?.({ node_data: storedata }) || {},
    [nodeContextExtender, storedata]
  );

  // Memoize nodecontext so that it’s recreated only if additionalContext or storedata change.
  const nodecontext = React.useMemo(
    () => ({ ...additionalContext, node_data: storedata }),
    [additionalContext, storedata]
  );

  const nodeHooks = renderplugins.NodeHooks[storedata.node_id];
  for (const hook of nodeHooks || []) {
    hook({ nodecontext: nodecontext });
  }

  // Call a hook when the node is mounted.
  useEffect(() => {
    fnrf_zst.worker?.call_hooks("node_mounted", storedata.id);
  }, [fnrf_zst.worker, storedata.id]);

  // Manage visual trigger state based on the node's in_trigger flag.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (intrigger && !visualTrigger) {
      setVisualTrigger(true);
    } else if (visualTrigger) {
      timeoutId = setTimeout(() => setVisualTrigger(false), 200);
    }
    return () => clearTimeout(timeoutId);
  }, [intrigger, visualTrigger]);

  return { visualTrigger, nodecontext };
};

interface NodeContextType {
  node_data: latest.NodeType;
  [key: string]: any | undefined;
}
interface RFNodeDataPass extends Record<string, unknown> {
  nodestore: latest.NodeStore;
}

const NodeContext = React.createContext<NodeContextType | null>(null);

const DefaultNode = ({ data }: { data: RFNodeDataPass }) => {
  // Use the  latest.NodeStore to get the data for the node.
  const storedata = data.nodestore.use();

  const collapsed = storedata.properties["frontend:collapsed"] || false;

  const { visualTrigger, nodecontext } = useDefaultNodeInjection(storedata);

  return (
    <NodeContext.Provider value={nodecontext}>
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
    </NodeContext.Provider>
  );
};

export default DefaultNode;
export { NodeName, NodeContext };
export type { NodeContextType, RFNodeDataPass };
