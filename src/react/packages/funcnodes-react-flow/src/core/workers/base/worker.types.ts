import type { FuncNodesReactFlow } from "@/funcnodes-context";
import type { FuncNodesWorker } from "./funcnodes-worker";

export interface WorkerProps {
  zustand?: FuncNodesReactFlow;
  uuid: string;
  on_error?: (error: string | Error) => void;
  on_sync_complete?: (worker: FuncNodesWorker) => Promise<void>;
}

export interface WorkerHookProperties {
  worker: FuncNodesWorker;
  data: any;
}

export interface FuncNodesWorkerState {
  is_open: boolean;
}
