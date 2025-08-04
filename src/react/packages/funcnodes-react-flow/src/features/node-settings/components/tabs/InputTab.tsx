import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { NodeIOSettings } from "../io";
import { IOContext, useNodeStore } from "@/nodes";

interface InputTabProps {
  splitnodesettingsPath?: string[];
}

export const InputTab = ({ splitnodesettingsPath = [] }: InputTabProps) => {
  const nodestore = useNodeStore();
  const inputs = nodestore.use((state) => state.inputs);
  return (
    <Tabs.Root
      defaultValue={splitnodesettingsPath[0] || inputs[0]}
      className="nodesettings-tabs funcnodes-control-root"
    >
      <Tabs.List
        className="nodesettings-tabs-list"
        aria-label="Manage node inputs"
      >
        {inputs.map((inputID) => (
          <Tabs.Trigger
            key={inputID}
            value={inputID}
            className="nodesettings-tabs-trigger"
          >
            {inputID}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {inputs.map((inputID) => {
        const io_store = nodestore.io_stores.get(inputID);
        return (
          <Tabs.Content
            key={inputID}
            value={inputID}
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
