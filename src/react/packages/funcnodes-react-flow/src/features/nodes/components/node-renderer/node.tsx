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
  OpenInFullIcon,
} from "@/icons";
import { IODataOverlay, IOPreviewWrapper } from "./io/iodataoverlay";
import { NodeSettingsOverlay } from "@/node-settings";
import { useKeyPress } from "@/providers";
import { CustomDialog } from "@/shared-components";
import { useWorkerApi } from "@/workers";
import type { IOStore, NodeStore, NodeType } from "@/nodes-core";
import {
  isExecutableGroupNode,
  isGroupInputGateway,
  isGroupOutputGateway,
} from "@/nodes-core";

import { IOContext, NodeContext, useNodeStore } from "../../provider";
import { RenderMappingContext } from "@/data-rendering";

interface NodeHeaderProps {
  toogleShowSettings?: () => void;
}

interface GroupNodePresentation {
  isExecutableGroup: boolean;
  isInputGateway: boolean;
  isOutputGateway: boolean;
}

/** Returns presentation flags for executable group and gateway node kinds. */
const getGroupNodePresentation = (
  node: Pick<NodeType, "node_id">
): GroupNodePresentation => ({
  isExecutableGroup: isExecutableGroupNode(node),
  isInputGateway: isGroupInputGateway(node),
  isOutputGateway: isGroupOutputGateway(node),
});

/** Picks the most user-facing label available for group navigation affordances. */
const getNodeDisplayLabel = (
  node: Pick<NodeType, "id" | "name" | "node_name">
): string => node.name || node.node_name || node.id;

const NodeHeader = React.memo(({ toogleShowSettings }: NodeHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const { node } = useWorkerApi();
  const nodestore = useNodeStore();
  const { id, description, node_name, name, node_id } = nodestore.useShallow(
    (state) => ({
      id: state.id,
      description: state.description,
      node_name: state.node_name,
      name: state.name,
      node_id: state.node_id,
    })
  );
  const { isExecutableGroup } = getGroupNodePresentation({ node_id });
  const groupLabel = getNodeDisplayLabel({ id, name, node_name });

  const clicktrigger = React.useCallback(() => {
    fnrf_zst.on_node_action({
      type: "trigger",
      from_remote: false,
      id: id,
    });
  }, [fnrf_zst, id]);

  /**
   * Enters the executable group from the header button while leaving the
   * canvas-level double-click navigation behavior available on the node body.
   */
  const enterGroup = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        fnrf_zst.enter_group_nodespace(id, groupLabel);
        await fnrf_zst.sync_active_nodespace();
      } catch (error) {
        const description =
          error instanceof Error ? error.message : String(error);
        fnrf_zst.getStateManager().toaster?.error({
          title: "Could not enter group",
          description,
        });
      }
    },
    [fnrf_zst, id, groupLabel]
  );

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
        {isExecutableGroup && (
          <button
            type="button"
            aria-label={`Enter group ${groupLabel}`}
            title={`Enter group ${groupLabel}`}
            className="groupenterbutton nodeheaderbutton nodrag"
            data-no-group-enter="true"
            onClick={enterGroup}
          >
            <OpenInFullIcon fontSize="inherit" />
          </button>
        )}
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

/** Renders a compact boundary label for internal group gateway nodes. */
const GroupGatewayLabel = React.memo(
  ({ presentation }: { presentation: GroupNodePresentation }) => {
    if (presentation.isInputGateway) {
      return <div className="group-gateway-label">Group Input Gateway</div>;
    }
    if (presentation.isOutputGateway) {
      return <div className="group-gateway-label">Group Output Gateway</div>;
    }
    return null;
  }
);

const InnerNode = () => {
  const nodestore = useNodeStore();
  const { id, collapsed, error, node_id } = nodestore.useShallow((state) => ({
    id: state.id,
    collapsed: state.properties["frontend:collapsed"] || false,
    error: state.error,
    node_id: state.node_id,
  }));
  const presentation = getGroupNodePresentation({ node_id });
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
      data-testid={`fn-node-${id}`}
      className={
        "innernode" +
        (visualTrigger ? " intrigger" : "") +
        (error ? " error" : "") +
        (presentation.isExecutableGroup ? " executable-group-node" : "") +
        (presentation.isInputGateway || presentation.isOutputGateway
          ? " group-gateway-node"
          : "") +
        (presentation.isInputGateway ? " group-input-gateway-node" : "") +
        (presentation.isOutputGateway ? " group-output-gateway-node" : "")
      }
      onClick={onClickHandler}
    >
      <NodeHeader toogleShowSettings={toogleShowSettings} />
      <GroupGatewayLabel presentation={presentation} />
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
