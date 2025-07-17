import { createContext, useContext } from "react";
import {
  FuncNodesReactFlowZustand,
  FuncNodesReactFlowZustandInterface,
} from "../../barrel_imports";
import { DEFAULT_FN_PROPS_FACTORY } from "../app-properties";
export const FuncNodesContext =
  createContext<FuncNodesReactFlowZustandInterface>(
    FuncNodesReactFlowZustand(DEFAULT_FN_PROPS_FACTORY())
  );

export const useFuncNodesContext = () => {
  const context = useContext(FuncNodesContext);
  if (!context) {
    throw new Error(
      "useFuncNodesContext must be used within a FuncNodesContext"
    );
  }
  return context;
};
