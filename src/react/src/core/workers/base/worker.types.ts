import { FuncNodesWorker } from "./funcnodes-worker";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";

export interface WorkerProps {
  zustand?: FuncNodesReactFlowZustandInterface;
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
