import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";
import { useFuncNodesContext } from "@/providers";
import {
  WorkerEdgeManagerAPI,
  WorkerGroupManagerAPI,
  WorkerHookManagerAPI,
  WorkerNodeManagerAPI,
} from "../base/handlers";

export const useWorkerApi = (): {
  node: WorkerNodeManagerAPI | undefined;
  group: WorkerGroupManagerAPI | undefined;
  edge: WorkerEdgeManagerAPI | undefined;
  hooks: WorkerHookManagerAPI | undefined;
} => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  if (!fnrf_zst.worker) {
    return {
      node: undefined,
      group: undefined,
      edge: undefined,
      hooks: undefined,
    };
  }
  return fnrf_zst.worker.api;
};
