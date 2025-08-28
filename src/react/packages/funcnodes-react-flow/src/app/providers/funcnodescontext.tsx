import { createContext, useContext } from "react";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const FuncNodesContext = createContext<FuncNodesReactFlow | null>(null);

export const useFuncNodesContext = () => {
  const context = useContext(FuncNodesContext);
  if (!context) {
    throw new Error(
      "useFuncNodesContext must be used within a FuncNodesContext.Provider"
    );
  }
  return context;
};
