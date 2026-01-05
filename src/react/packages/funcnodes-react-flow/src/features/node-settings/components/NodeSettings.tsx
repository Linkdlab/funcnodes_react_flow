import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { NodeSettingsInput, NodeSettingsOutput } from "./io";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@/icons";
import { ExpandingContainer } from "@/shared-components/auto-layouts";
import { IOContext, NodeContext } from "@/nodes";
import { NodeName } from "@/nodes-components";
import { NodeStore } from "@/nodes-core";

const CurrentNodeSettings = ({ nodestore }: { nodestore: NodeStore }) => {
  const node = nodestore.use();

  return (
    <NodeContext.Provider value={nodestore}>
      <div className="nodesettings_content">
        <div className="nodesettings_section">
          <div className="nodesettings_component">
            <div>Name</div>
            <div>
              <NodeName />
            </div>
          </div>
        </div>
        <div className="nodesettings_section">
          <div>Inputs</div>
          {node.inputs.map((ioname) => {
            const io = nodestore.io_stores.get(ioname);
            if (!io) return;
            return (
              <IOContext.Provider value={io} key={ioname}>
                <NodeSettingsInput />
              </IOContext.Provider>
            );
          })}
        </div>
        <div className="nodesettings_section">
          <div>Outputs</div>
          {node.outputs.map((ioname) => {
            const io = nodestore.io_stores.get(ioname);
            if (!io) return;
            return (
              <IOContext.Provider value={io} key={ioname}>
                <NodeSettingsOutput />
              </IOContext.Provider>
            );
          })}
        </div>
      </div>
    </NodeContext.Provider>
  );
};

const CurrentNodeSettingsWrapper = () => {
  const fnrf_zst = useFuncNodesContext();
  const selected_nodes = fnrf_zst.local_state((state) => state.selected_nodes);
  if (selected_nodes.length === 0) {
    return <div>Node Settings</div>;
  }
  if (selected_nodes.length > 1) {
    return <div>Multiple Nodes Selected</div>;
  }
  const nodestore = fnrf_zst.nodespace.get_node(selected_nodes[0]);
  if (!nodestore) {
    return <div>Node not found</div>;
  }

  return <CurrentNodeSettings nodestore={nodestore} />;
};

export const NodeSettings = () => {
  const fnrf_zst = useFuncNodesContext();
  const expanded = fnrf_zst.local_settings(
    (state) => state.view_settings.expand_node_props
  );

  const set_expand_node_props = (expand: boolean) => {
    fnrf_zst.update_view_settings({ expand_node_props: expand });
  };

  return (
    <ExpandingContainer
      direction="left"
      expanded={expanded === undefined ? false : expanded}
      containerClassName={`pos-right pos-top bg1 h-12`}
      className="nodesettings_content"
      onExpandChange={set_expand_node_props}
      collapseIcons={{
        up: ChevronDownIcon,
        down: ChevronUpIcon,
        left: ChevronRightIcon,
        right: ChevronLeftIcon,
      }}
      expandIcons={{
        up: ChevronUpIcon,
        down: ChevronDownIcon,
        left: ChevronLeftIcon,
        right: ChevronRightIcon,
      }}
    >
      <CurrentNodeSettingsWrapper />
    </ExpandingContainer>
  );
};
