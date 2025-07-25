import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { latest } from "@/barrel_imports";
import { NodeSettingsInput, NodeSettingsOutput } from "./io";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@/icons";
import { ExpandingContainer } from "@/shared-components/auto-layouts";
import { NodeName } from "@/nodes";

const CurrentNodeSettings = ({
  nodestore,
}: {
  nodestore: latest.NodeStore;
}) => {
  const node = nodestore.use();

  return (
    <div className="nodesettings_content">
      <div className="nodesettings_section">
        <div className="nodesettings_component">
          <div>Name</div>
          <div>
            <NodeName node_data={node} />
          </div>
        </div>
      </div>
      <div className="nodesettings_section">
        <div>Inputs</div>
        {node.inputs.map((ioname) => (
          <NodeSettingsInput iostore={node.io[ioname]!} key={ioname} />
        ))}
      </div>
      <div className="nodesettings_section">
        <div>Outputs</div>
        {node.outputs.map((ioname) => (
          <NodeSettingsOutput iostore={node.io[ioname]!} key={ioname} />
        ))}
      </div>
    </div>
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

  const update_view_settings = fnrf_zst.local_settings(
    (state) => state.update_view_settings
  );

  const set_expand_node_props = (expand: boolean) => {
    update_view_settings({ expand_node_props: expand });
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
