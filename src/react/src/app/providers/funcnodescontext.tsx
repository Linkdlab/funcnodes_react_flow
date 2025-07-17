import { createContext, useContext } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../barrel_imports";

export const FuncNodesContext =
  createContext<FuncNodesReactFlowZustandInterface | null>(null);

export const useFuncNodesContext = () => {
  const context = useContext(FuncNodesContext);
  if (!context) {
    throw new Error(
      "useFuncNodesContext must be used within a FuncNodesContext.Provider"
    );
  }
  return context;
};
