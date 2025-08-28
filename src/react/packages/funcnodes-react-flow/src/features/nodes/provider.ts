import { IOStore, NodeStore } from "@/nodes-core";
import * as React from "react";
import { useContext } from "react";

export const NodeContext = React.createContext<NodeStore>({} as NodeStore);

export const useNodeStore = () => {
  const nodstore = useContext(NodeContext);
  return nodstore;
};

export const IOContext = React.createContext<IOStore | undefined>(undefined);

// Function overloads for better TypeScript typing
export function useIOStore(): IOStore;
export function useIOStore(io: string): IOStore | undefined;
export function useIOStore(io: string | undefined): IOStore | undefined;
export function useIOStore(io?: string): IOStore | undefined {
  if (io) {
    const nodestore = useNodeStore();
    return nodestore.io_stores.get(io);
  } else {
    const iostore = useContext(IOContext);
    if (!iostore) {
      throw new Error("IOContext not set");
    }
    return iostore;
  }
}
