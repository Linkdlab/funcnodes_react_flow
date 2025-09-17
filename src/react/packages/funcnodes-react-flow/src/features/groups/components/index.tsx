import * as React from "react";
import { useRemoveGroups } from "../hooks";
import { CloseIcon, ChevronDownIcon, ChevronUpIcon } from "@/icons";
import "./groups.scss";
import { Handle, Position } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";
import { useWorkerApi } from "@/workers";
import { GroupActionUpdate } from "@/funcnodes-context";
import {
  CollapsedGroupVisualState,
  CollapsedGroupIO,
  GroupRFNodeData,
} from "@/nodes";

export interface NodeGroupMeta {
  collapsed?: boolean;
  name?: string;
  label?: string;
  [key: string]: any;
}

export interface NodeGroup {
  node_ids: string[];
  child_groups: string[];
  parent_group: string | null;
  meta: NodeGroupMeta;
  position: [number, number];
}

export interface NodeGroups {
  [key: string]: NodeGroup;
}

// The default Node rendering component for groups
export const DefaultGroup = ({ data }: { data: GroupRFNodeData }) => {
  const groupId = data?.group?.id || data?.id;
  const removeGroups = useRemoveGroups();
  const fnrf = useFuncNodesContext();
  const { group: groupApi } = useWorkerApi();

  const collapsed = data?.collapsed ?? data?.group?.meta?.collapsed ?? false;
  const collapsedInfo: CollapsedGroupVisualState = data?.collapsedInfo ?? {
    inputs: [],
    outputs: [],
  };
  const label =
    data?.group?.meta?.name || data?.group?.meta?.label || groupId || "Group";

  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (groupId) {
        removeGroups([groupId]);
      }
    },
    [groupId, removeGroups]
  );

  const toggleCollapsed = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!groupId) {
        return;
      }
      const next = !collapsed;
      const update: GroupActionUpdate = {
        type: "update",
        id: groupId,
        group: { meta: { collapsed: next } },
        from_remote: true,
      };
      fnrf.on_group_action(update);
      const workerUpdate: GroupActionUpdate = {
        ...update,
        from_remote: false,
        immediate: true,
      };
      groupApi?.locally_update_group(workerUpdate);
    },
    [collapsed, fnrf, groupApi, groupId]
  );

  const renderIoRow = React.useCallback(
    (io: CollapsedGroupIO, direction: "input" | "output") => {
      const isInput = direction === "input";
      const connectionLabel =
        io.connectionCount > 0
          ? `${io.connectionCount} connection${
              io.connectionCount > 1 ? "s" : ""
            }`
          : undefined;
      return (
        <div
          key={io.handleId}
          className={`fn-group-io fn-group-io--${direction}`}
          title={`${io.nodeName} • ${io.ioName}`}
        >
          {isInput ? (
            <Handle
              id={io.handleId}
              type="target"
              position={Position.Left}
              className="fn-group-io__handle"
              data-type={io.type}
            />
          ) : null}
          <div className="fn-group-io__label">
            <span className="fn-group-io__label-node">{io.nodeName}</span>
            <span className="fn-group-io__label-name">{io.ioName}</span>
            {io.connectionCount > 0 ? (
              <span
                className="fn-group-io__badge"
                title={connectionLabel}
                aria-label={connectionLabel}
              >
                {io.connectionCount}
              </span>
            ) : null}
          </div>
          {!isInput ? (
            <Handle
              id={io.handleId}
              type="source"
              position={Position.Right}
              className="fn-group-io__handle"
              data-type={io.type}
            />
          ) : null}
        </div>
      );
    },
    []
  );

  if (collapsed) {
    const hasInputs = collapsedInfo.inputs.length > 0;
    const hasOutputs = collapsedInfo.outputs.length > 0;
    const hasIo = hasInputs || hasOutputs;
    return (
      <div className="fn-group-collapsed-wrapper">
        <div className="fn-group-collapsed react-flow__node-default">
          <div className="innernode">
            <div className="nodeheader">
              <div className="nodeheader_element">
                <button
                  className="nodeheaderbutton fn-group-collapsed__button"
                  onClick={toggleCollapsed}
                  title="Expand group"
                >
                  <ChevronDownIcon />
                </button>
              </div>
              <div className="nodeheader_element nodeheader_title">
                <div className="nodeheader_title_text">{label}</div>
              </div>
              <div className="nodeheader_element">
                <button
                  className="nodeheaderbutton fn-group-collapsed__button"
                  onClick={handleRemove}
                  title="Remove group"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className="nodebody fn-group-collapsed__body">
              {hasIo ? (
                <div className="fn-group-collapsed__columns">
                  <div className="fn-group-collapsed__column fn-group-collapsed__column--inputs">
                    {collapsedInfo.inputs.map((io) =>
                      renderIoRow(io, "input")
                    )}
                  </div>
                  <div className="fn-group-collapsed__column fn-group-collapsed__column--outputs">
                    {collapsedInfo.outputs.map((io) =>
                      renderIoRow(io, "output")
                    )}
                  </div>
                </div>
              ) : (
                <div className="fn-group-collapsed__empty">No exposed IOs</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fn-group">
      <button
        className="fn-group-toggle"
        title="Collapse group"
        onClick={toggleCollapsed}
      >
        <ChevronUpIcon />
      </button>
      <button
        className="fn-group-remove"
        title="Remove group"
        onClick={handleRemove}
      >
        <CloseIcon />
      </button>
      {label}
    </div>
  );
};
