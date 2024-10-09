import { StoreApi, UseBoundStore } from "zustand";
import { FuncNodesWorker, WorkerManager } from "../funcnodes";
import {
  ExternalWorkerDependecies,
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
  worker_dependencies: ExternalWorkerDependecies[];
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

type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent
  | WorkerEvent;

interface WorkerRepresentation {
  uuid: string;
  host: string;
  port: number;
  ssl: boolean;
  active: boolean;
  name: string | null;
}
interface WorkersState {
  [key: string]: WorkerRepresentation;
}

interface FuncnodesReactHeaderProps {}
interface FuncnodesReactFlowProps {
  useWorkerManager?: boolean;
  default_worker?: FuncNodesWorker;
  header?: FuncnodesReactHeaderProps;
  id?: string;
}

interface DevSettings {
  debug: boolean;
}

interface FuncnodesReactFlowViewSettings {
  expand_node_props: boolean;
}
interface FuncnodesReactFlowLocalSettings {
  view_settings: FuncnodesReactFlowViewSettings;
  update_view_settings: (settings: FuncnodesReactFlowViewSettings) => void;
}

interface FuncnodesReactFlowLocalState {
  selected_nodes: string[];
  selected_edges: string[];
}

interface FuncNodesReactFlowZustandInterface {
  options: FuncnodesReactFlowProps;
  local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
  local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
  lib: LibZustandInterface;
  workermanager: WorkerManager | undefined;
  workers: UseBoundStore<StoreApi<WorkersState>>;
  worker: FuncNodesWorker | undefined;
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
  NodeViewState,
  FuncnodesReactFlowProps,
  FuncnodesReactHeaderProps,
  FuncnodesReactFlowLocalSettings,
  FuncnodesReactFlowLocalState,
  FuncnodesReactFlowViewSettings,
};
