import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { latest } from "@/barrel_imports";
import { GeneralTab, InputTab, OutputTab } from "./tabs";

interface NodeSettingsWindowProps {
  node_data: latest.NodeType;
  nodeSettingsPath: string;
}

export const NodeSettingsWindow = ({
  node_data,
  nodeSettingsPath,
}: NodeSettingsWindowProps) => {
  const splitnodesettingsPath = nodeSettingsPath.split("/") || ["general"];
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || "general"}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node settings"
      >
        <Tabs.Trigger value="general" className="nodesettings-tabs-trigger">
          General
        </Tabs.Trigger>
        <Tabs.Trigger value="inputs" className="nodesettings-tabs-trigger">
          Inputs
        </Tabs.Trigger>
        <Tabs.Trigger value="outputs" className="nodesettings-tabs-trigger">
          Outputs
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="general" className="nodesettings-tabs-content">
        <GeneralTab node_data={node_data} />
      </Tabs.Content>

      <Tabs.Content
        value="inputs"
        className="nodesettings-tabs-content nodesettings-io-list"
      >
        <InputTab
          node_data={node_data}
          splitnodesettingsPath={
            // all but first element
            splitnodesettingsPath.slice(1)
          }
        />
      </Tabs.Content>

      <Tabs.Content
        value="outputs"
        className="nodesettings-tabs-content nodesettings-io-list"
      >
        <OutputTab
          node_data={node_data}
          splitnodesettingsPath={
            // all but first element
            splitnodesettingsPath.slice(1)
          }
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
