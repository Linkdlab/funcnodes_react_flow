import { useFuncNodesContext } from "@/providers";
import type { WorkerEdgeManagerAPI, WorkerGroupManagerAPI, WorkerHookManagerAPI, WorkerLibraryManagerAPI, WorkerNodeManagerAPI } from "../base/handlers";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import type { FuncNodesWorker } from "../base/funcnodes-worker";

export const useWorkerApi = (): {
  node: WorkerNodeManagerAPI | undefined;
  group: WorkerGroupManagerAPI | undefined;
  edge: WorkerEdgeManagerAPI | undefined;
  hooks: WorkerHookManagerAPI | undefined;
  lib: WorkerLibraryManagerAPI | undefined;
  worker: FuncNodesWorker | undefined;
} => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  if (!fnrf_zst.worker) {
    return {
      node: undefined,
      group: undefined,
      edge: undefined,
      hooks: undefined,
      lib: undefined,
      worker: fnrf_zst.worker,
    };
  }
  return {
    ...fnrf_zst.worker.api,
    worker: fnrf_zst.worker,
  };
};
