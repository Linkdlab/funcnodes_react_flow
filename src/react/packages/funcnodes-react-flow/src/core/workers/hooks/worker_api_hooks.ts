import { useFuncNodesContext } from "@/providers";
import {
  WorkerEdgeManagerAPI,
  WorkerGroupManagerAPI,
  WorkerHookManagerAPI,
  WorkerLibraryManagerAPI,
  WorkerNodeManagerAPI,
} from "../base/handlers";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const useWorkerApi = (): {
  node: WorkerNodeManagerAPI | undefined;
  group: WorkerGroupManagerAPI | undefined;
  edge: WorkerEdgeManagerAPI | undefined;
  hooks: WorkerHookManagerAPI | undefined;
  lib: WorkerLibraryManagerAPI | undefined;
} => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  if (!fnrf_zst.worker) {
    return {
      node: undefined,
      group: undefined,
      edge: undefined,
      hooks: undefined,
      lib: undefined,
    };
  }
  return fnrf_zst.worker.api;
};
