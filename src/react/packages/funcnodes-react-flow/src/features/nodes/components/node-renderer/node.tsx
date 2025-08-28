import * as React from "react";
import { useEffect, useState } from "react";

import { FuncNodesReactFlow } from "@/funcnodes-context";
import { useFuncNodesContext } from "@/providers";
import { NodeInput, NodeOutput } from "./io";

import {
  useBodyDataRendererForIo,
  useDefaultNodeInjection,
  useIOGetFullValue,
} from "../../hooks";
import { ProgressBar } from "@/shared-components";
import {
  PlayCircleFilledIcon,
  LanIcon,
  GearIcon,
  ExpandLessIcon,
} from "@/icons";
import { IODataOverlay, IOPreviewWrapper } from "./io/iodataoverlay";
import { NodeSettingsOverlay } from "@/node-settings";
import { useKeyPress } from "@/providers";
import { CustomDialog } from "@/shared-components";
import { useWorkerApi } from "@/workers";
import { IOStore, NodeStore } from "@/nodes-core";

import { IOContext, NodeContext, useNodeStore } from "../../provider";
import { RenderMappingContext } from "@/data-rendering";

interface NodeHeaderProps {
  toogleShowSettings?: () => void;
}

const NodeHeader = React.memo(({ toogleShowSettings }: NodeHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const { node } = useWorkerApi();
  const nodestore = useNodeStore();
  const { id, description, node_name } = nodestore.useShallow((state) => ({
    id: state.id,
    description: state.description,
    node_name: state.node_name,
  }));

  const clicktrigger = React.useCallback(() => {
    fnrf_zst.on_node_action({
      type: "trigger",
      from_remote: false,
      id: id,
    });
  }, [fnrf_zst, id]);
  return (
    <div className="nodeheader" title={description || node_name}>
      <div className="nodeheader_element">
        <PlayCircleFilledIcon
          fontSize="inherit"
          className="triggerbutton nodeheaderbutton "
          onClick={clicktrigger}
        />
        <LanIcon
          fontSize="inherit"
          className="nodestatusbutton nodeheaderbutton"
          onClick={async () => {
            if (node) {
              console.log("nodestatus", await node.get_node_status(id));
            }
          }}
        />
        <GearIcon
          fontSize="inherit"
          className="nodesettingsbutton nodeheaderbutton"
          onClick={() => {
            toogleShowSettings?.();
          }}
        />
      </div>
      <div className="nodeheader_element nodeheader_title">
        <div className="nodeheader_title_text">{node_name}</div>
      </div>
      <div className="nodeheader_element">
        <ExpandLessIcon fontSize="inherit" />
      </div>
    </div>
  );
});

interface NodeBodyProps {
  setNodeSettingsPath?: (path: string) => void;
  setShowSettings?: (show: boolean) => void;
}

const NodeIODataRenderer = React.memo(({ iostore }: { iostore: IOStore }) => {
  const io = iostore.use();
  const nodestore = useNodeStore();
  const render_options = nodestore.use((state) => state.render_options);
  const get_full_value = useIOGetFullValue(io.id);

  const [pvhandle, overlayhandle] = useBodyDataRendererForIo(io);

  return (
    <div
      className="nodrag nodedatabody"
      data-src={render_options?.data?.src || ""}
    >
      {pvhandle && io && (
        <IOContext.Provider value={iostore}>
          <CustomDialog
            title={io.full_id}
            trigger={
              <div className="nodedatabutton">
                {<IOPreviewWrapper Component={pvhandle} />}
              </div>
            }
            onOpenChange={(open: boolean) => {
              if (open) {
                get_full_value?.();
              }
            }}
          >
            {overlayhandle && (
              <IODataOverlay Component={overlayhandle} iostore={iostore} />
            )}
          </CustomDialog>
        </IOContext.Provider>
      )}
    </div>
  );
});

const NodeBody = React.memo(
  ({ setShowSettings, setNodeSettingsPath }: NodeBodyProps) => {
    const nodestore = useNodeStore();
    const { render_options, outputs, inputs } = nodestore.useShallow(
      (state) => ({
        render_options: state.render_options,
        outputs: state.outputs,
        inputs: state.inputs,
      })
    );

    const datarenderio = render_options?.data?.src
      ? nodestore.io_stores.get(render_options?.data?.src)
      : undefined;

    return (
      <div className="nodebody nowheel ">
        {outputs.map((ioname) => {
          const io = nodestore.io_stores.get(ioname);
          if (!io) return;
          return (
            <IOContext.Provider value={io} key={ioname}>
              <NodeOutput
                setNodeSettingsPath={setNodeSettingsPath}
                setShowSettings={setShowSettings}
              />
            </IOContext.Provider>
          );
        })}
        {datarenderio && <NodeIODataRenderer iostore={datarenderio} />}
        {inputs.map((ioname) => {
          const io = nodestore.io_stores.get(ioname);
          if (!io) return;
          return (
            <IOContext.Provider value={io} key={ioname}>
              <NodeInput
                setNodeSettingsPath={setNodeSettingsPath}
                setShowSettings={setShowSettings}
              />
            </IOContext.Provider>
          );
        })}
      </div>
    );
  }
);

export const NodeName = () => {
  const nodestore = useNodeStore();
  const { original_name, id } = nodestore.useShallow((state) => ({
    original_name: state.name,
    id: state.id,
  }));

  const [name, setName] = useState(original_name);

  useEffect(() => {
    setName(original_name);
  }, [original_name]);

  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const finalSetName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const new_name = e.target.value;
    if (new_name !== original_name) {
      fnrf_zst.on_node_action({
        type: "update",
        from_remote: false,
        id: id,
        node: { name: new_name },
      });
    }
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

const NodeProgressBar = () => {
  const nodestore = useNodeStore();
  const progress = nodestore.use((state) => state.progress);
  if (!progress) return null;
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

const NodeFooter = React.memo(() => {
  const nodestore = useNodeStore();
  const error = nodestore.use((state) => state.error);

  return (
    <div className="nodefooter">
      {error && <div className="nodeerror">{error}</div>}
      <NodeProgressBar />
    </div>
  );
});

export interface RFNodeDataPass extends Record<string, unknown> {
  nodestore: NodeStore;
}

const InnerNode = () => {
  const nodestore = useNodeStore();
  const { collapsed, error, node_id } = nodestore.useShallow((state) => ({
    collapsed: state.properties["frontend:collapsed"] || false,
    error: state.error,
    node_id: state.node_id,
  }));
  const { visualTrigger } = useDefaultNodeInjection(nodestore);
  const [showSettings, setShowSettings] = useState(false);
  const [nodeSettingsPath, setNodeSettingsPath] = useState<string>("");
  const { keys: pressedKeys } = useKeyPress();

  const renderplugins = React.useContext(RenderMappingContext);
  const nodeHookComponents = renderplugins.NodeHooks[node_id] ?? [];

  const toogleShowSettings = React.useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pressedKeys.has("s") && !showSettings) {
      setNodeSettingsPath("");
      setShowSettings(true);
      e.stopPropagation();
    }
  };

  return (
    <div
      className={
        "innernode" +
        (visualTrigger ? " intrigger" : "") +
        (error ? " error" : "")
      }
      onClick={onClickHandler}
    >
      <NodeHeader toogleShowSettings={toogleShowSettings} />
      <NodeName />
      {collapsed ? null : (
        <NodeBody
          setNodeSettingsPath={setNodeSettingsPath}
          setShowSettings={setShowSettings}
        />
      )}
      <NodeFooter />
      <NodeSettingsOverlay
        isOpen={showSettings}
        onOpenChange={setShowSettings}
        nodeSettingsPath={nodeSettingsPath}
      ></NodeSettingsOverlay>
      {/* ✅ Inject hooks properly as React components */}
      {nodeHookComponents.map((HookComponent, i) => (
        <React.Fragment key={i}>
          <HookComponent />
        </React.Fragment>
      ))}
    </div>
  );
};

export const DefaultNode = React.memo(
  ({ data }: { data: RFNodeDataPass }) => {
    // Use useShallow to only subscribe to specific properties that affect rendering

    return (
      <NodeContext.Provider value={data.nodestore}>
        {/* <NodeResizeControl
        minWidth={100}
        minHeight={100}
        className="noderesizecontrol"
      >
        <ExpandIcon fontSize="inherit" className="noderesizeicon" />
      </NodeResizeControl> */}
        <InnerNode />
      </NodeContext.Provider>
    );
  },
  (prev, next) => {
    return prev.data.nodestore === next.data.nodestore;
  }
);
