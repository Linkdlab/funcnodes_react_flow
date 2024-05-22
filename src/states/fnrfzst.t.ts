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
type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent;

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
interface FuncnodesReactFlowProps {
  useWorkerManager?: boolean;
  default_worker?: FuncNodesWorker;
}

interface FuncNodesReactFlowZustandInterface {
  options: FuncnodesReactFlowProps;
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
  NodeViewState,
  FuncnodesReactFlowProps,
};
