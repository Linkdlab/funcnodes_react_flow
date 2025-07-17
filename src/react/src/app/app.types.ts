import { Logger } from "@/logging";
import { FuncNodesWorker } from "@/workers";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";

export interface ReactFlowLayerProps {
  minimap: boolean;
  static: boolean;
  minZoom: number;
  maxZoom: number;
  allowFullScreen: boolean;
  allowExpand: boolean;
  showNodeSettings: boolean;
}

export interface FuncnodesReactHeaderProps {
  show: boolean;
  showmenu: boolean;
}
export interface ReactFlowLibraryProps {
  show: boolean;
}
export interface FuncnodesReactFlowProps {
  id: string;
  debug: boolean;
  on_sync_complete?: (worker: FuncNodesWorker) => Promise<void>;
  useWorkerManager: boolean;
  show_library: boolean;
  load_worker?: string;
  worker?: FuncNodesWorker;
  header: FuncnodesReactHeaderProps;
  flow: ReactFlowLayerProps;
  library: ReactFlowLibraryProps;
  worker_url?: string;
  fnw_url?: string;
  workermanager_url?: string;
  logger?: Logger;
  on_ready?: ({
    fnrf_zst,
  }: {
    fnrf_zst: FuncNodesReactFlowZustandInterface;
  }) => void;
}
