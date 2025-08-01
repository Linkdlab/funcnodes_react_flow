import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { GeneralTab, InputTab, OutputTab } from "./tabs";

interface NodeSettingsWindowProps {
  nodeSettingsPath: string;
}

export const NodeSettingsWindow = ({
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
        <GeneralTab />
      </Tabs.Content>

      <Tabs.Content
        value="inputs"
        className="nodesettings-tabs-content nodesettings-io-list"
      >
        <InputTab
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
          splitnodesettingsPath={
            // all but first element
            splitnodesettingsPath.slice(1)
          }
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
