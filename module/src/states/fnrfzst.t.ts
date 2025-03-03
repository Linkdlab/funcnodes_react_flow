import { StoreApi, UseBoundStore } from "zustand";
import { FuncNodesWorker, WorkerManager } from "../funcnodes";
import {
  ExternalWorkerDependencies,
  LibType,
  LibZustandInterface,
} from "./lib.t";
import { NodeSpaceZustandInterface } from "./nodespace.t";
import { NodeAction, NodeType } from "./node.t";
import { RFStore } from "./reactflow.t";
import { EdgeAction } from "./edge.t";
import { useReactFlow } from "reactflow";
import FuncNodesReactPlugin from "../plugin";
import { Logger } from "../utils/logger";
import { FuncNodesWorkerState } from "../funcnodes/funcnodesworker";

interface RenderOptions {
  typemap?: { [key: string]: string };
  inputconverter?: { [key: string]: string };
}
interface NodeViewState {
  pos: [number, number];
  size: [number, number];
  collapsed: boolean;
}
interface ViewState {
  nodes: { [key: string]: NodeViewState };
  renderoptions?: RenderOptions;
}

interface FullNodeSpaceJSON {
  nodes: NodeType[];
  edges: [string, string, string, string][];
  prop: { [key: string]: any };
  lib: LibType;
}

interface FullState {
  backend: FullNodeSpaceJSON;
  view: ViewState;
  worker: { [key: string]: string[] };
  worker_dependencies: ExternalWorkerDependencies[];
}

interface ProgressState {
  message: string;
  status: string;
  progress: number;
  blocking: boolean;
}

interface ProgressStateMessage extends ProgressState {
  type: "progress";
}

interface ResultMessage {
  type: "result";
  id?: string;
  result: any;
}

interface ErrorMessage {
  type: "error";
  error: string;
  tb: string[];
  id?: string;
}

interface NodeSpaceEvent {
  type: "nsevent";
  event: string;
  data: { [key: string]: any };
}

interface WorkerEvent {
  type: "workerevent";
  event: string;
  data: { [key: string]: any };
}

interface LargeMessageHint {
  type: "large_message";
  msg_id: string;
}

interface PongMessage {
  type: "pong";
}

type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent
  | WorkerEvent
  | LargeMessageHint
  | PongMessage;

interface WorkerRepresentation {
  uuid: string;
  host: string;
  port: number;
  ssl: boolean;
  active: boolean;
  open: boolean;
  name: string | null;
}
interface WorkersState {
  [key: string]: WorkerRepresentation;
}

interface FuncnodesReactHeaderProps {
  show: boolean;
  showmenu: boolean;
}

interface ReactFlowLibraryProps {
  show: boolean;
}
interface ReactFlowLayerProps {
  minimap: boolean;
  static: boolean;
  minZoom: number;
  maxZoom: number;
  allowFullScreen: boolean;
  allowExpand: boolean;
  showNodeSettings: boolean;
}

interface FuncnodesReactFlowProps {
  id: string;
  debug: boolean;
  on_sync_complete?: (worker: FuncNodesWorker) => Promise<void>;
  useWorkerManager: boolean;
  show_library: boolean;
  worker?: FuncNodesWorker;
  header: FuncnodesReactHeaderProps;
  flow: ReactFlowLayerProps;
  library: ReactFlowLibraryProps;
  worker_url?: string;
  fnw_url?: string;
  workermanager_url?: string;
}

interface DevSettings {
  debug: boolean;
}

interface FuncnodesReactFlowViewSettings {
  expand_node_props?: boolean;
  expand_lib?: boolean;
}
interface FuncnodesReactFlowLocalSettings {
  view_settings: FuncnodesReactFlowViewSettings;
  update_view_settings: (settings: FuncnodesReactFlowViewSettings) => void;
}

interface FuncnodesReactFlowLocalState {
  selected_nodes: string[];
  selected_edges: string[];
  funcnodescontainerRef: HTMLDivElement | null;
}

interface FuncNodesReactFlowZustandInterface {
  options: FuncnodesReactFlowProps;
  local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
  local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
  lib: LibZustandInterface;
  workermanager: WorkerManager | undefined;
  workers: UseBoundStore<StoreApi<WorkersState>>;
  workerstate: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
  worker: FuncNodesWorker | undefined;
  set_worker: (worker: FuncNodesWorker | undefined) => void;
  _unsubscribeFromWorker: (() => void) | undefined;

  nodespace: NodeSpaceZustandInterface;
  useReactFlowStore: RFStore;
  render_options: UseBoundStore<StoreApi<RenderOptions>>;
  progress_state: UseBoundStore<StoreApi<ProgressState>>;
  update_render_options: (options: RenderOptions) => void;
  rf_instance?: ReturnType<typeof useReactFlow>;
  on_node_action: (action: NodeAction) => void;
  on_edge_action: (edge: EdgeAction) => void;
  set_progress: (progress: ProgressState) => void;
  auto_progress: () => void;
  plugins: UseBoundStore<StoreApi<{ [key: string]: FuncNodesReactPlugin }>>;
  add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
  reactflowRef: HTMLDivElement | null;

  clear_all: () => void;
  center_node: (node_id: string | string[]) => void;
  center_all: () => void;
  dev_settings: DevSettings;
  logger: Logger;
}

export type {
  FuncNodesReactFlowZustandInterface,
  WorkersState,
  WorkerRepresentation,
  JSONMessage,
  FullState,
  FullNodeSpaceJSON,
  ViewState,
  RenderOptions,
  ProgressState,
  ProgressStateMessage,
  ResultMessage,
  ErrorMessage,
  NodeSpaceEvent,
  WorkerEvent,
  LargeMessageHint,
  NodeViewState,
  FuncnodesReactFlowProps,
  FuncnodesReactHeaderProps,
  ReactFlowLayerProps,
  FuncnodesReactFlowLocalSettings,
  FuncnodesReactFlowLocalState,
  FuncnodesReactFlowViewSettings,
  ReactFlowLibraryProps,
};
