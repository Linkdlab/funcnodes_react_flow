import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { NodeIOSettings } from "../io";
import { IOContext, useNodeStore } from "@/nodes";

interface OutputTabProps {
  splitnodesettingsPath?: string[];
}

export const OutputTab = ({ splitnodesettingsPath = [] }: OutputTabProps) => {
  const nodestore = useNodeStore();
  const outputs = nodestore.use((state) => state.outputs);
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || outputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node outputs"
      >
        {outputs.map((outputID) => (
          <Tabs.Trigger
            key={outputID}
            value={outputID}
            className="nodesettings-tabs-trigger"
          >
            {outputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {outputs.map((outputID) => {
        const io_store = nodestore.io_stores.get(outputID);
        return (
          <Tabs.Content
            key={outputID}
            value={outputID}
            className="nodesettings-tabs-content nodesettings-io-list"
          >
            {io_store && (
              <IOContext.Provider value={io_store}>
                <NodeIOSettings />
              </IOContext.Provider>
            )}
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};
