import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { latest } from "@/barrel_imports";
import { NodeIOSettings } from "../io";

interface InputTabProps {
  node_data: latest.NodeType;
  splitnodesettingsPath?: string[];
}

export const InputTab = ({
  node_data,
  splitnodesettingsPath = [],
}: InputTabProps) => {
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || node_data.inputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node inputs"
      >
        {node_data.inputs.map((inputID) => (
          <Tabs.Trigger
            key={inputID}
            value={inputID}
            className="nodesettings-tabs-trigger"
          >
            {inputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {node_data.inputs.map((inputID) => (
        <Tabs.Content
          key={inputID}
          value={inputID}
          className="nodesettings-tabs-content nodesettings-io-list"
        >
          {node_data.io[inputID] && (
            <NodeIOSettings iostore={node_data.io[inputID]!} />
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
