import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { latest } from "@/barrel_imports";
import { NodeIOSettings } from "../io";

interface OutputTabProps {
  node_data: latest.NodeType;
  splitnodesettingsPath?: string[];
}

export const OutputTab = ({
  node_data,
  splitnodesettingsPath = [],
}: OutputTabProps) => {
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || node_data.outputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node outputs"
      >
        {node_data.outputs.map((outputID) => (
          <Tabs.Trigger
            key={outputID}
            value={outputID}
            className="nodesettings-tabs-trigger"
          >
            {outputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {node_data.outputs.map((outputID) => (
        <Tabs.Content
          key={outputID}
          value={outputID}
          className="nodesettings-tabs-content nodesettings-io-list"
        >
          {node_data.io[outputID] && (
            <NodeIOSettings iostore={node_data.io[outputID]!} />
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
