import { StoreApi, UseBoundStore } from "zustand";
import {
  ExternalWorkerDependencies,
  LibType,
  LibZustandInterface,
} from "./lib.t";
import { NodeSpaceZustandInterface } from "./nodespace.t";

import { RFStore } from "./reactflow.t";
import { EdgeAction } from "./edge.t";
import { useReactFlow } from "@xyflow/react";

import { latest } from "../types/versioned/versions.t";
import { GroupAction } from "./groups.t";
import { FuncnodesReactFlowProps } from "@/app";
import {
  FuncNodesWorker,
  FuncNodesWorkerState,
  WorkerManager,
  WorkersState,
} from "@/workers";
import { Logger } from "@/logging";
import { NodeGroups } from "@/groups";

export interface RenderOptions {
  typemap?: { [key: string]: string | undefined };
  inputconverter?: { [key: string]: string | undefined };
}
export interface NodeViewState {
  pos: [number, number];
  size: [number, number];
  collapsed: boolean;
}
export interface ViewState {
  nodes: { [key: string]: NodeViewState | undefined };
  renderoptions?: RenderOptions;
}

export interface FullNodeSpaceJSON {
  nodes: latest.SerializedNodeType[];
  edges: [string, string, string, string][];
  prop: { [key: string]: any | undefined };
  lib: LibType;
  groups?: NodeGroups;
}

export interface FullState {
  backend: FullNodeSpaceJSON;
  view: ViewState;
  worker: { [key: string]: string[] | undefined };
  worker_dependencies: ExternalWorkerDependencies[];
}

export interface ProgressState {
  message: string;
  status: string;
  progress: number;
  blocking: boolean;
}

export interface ProgressStateMessage extends ProgressState {
  type: "progress";
}

export interface DevSettings {
  debug: boolean;
}

export interface FuncnodesReactFlowViewSettings {
  expand_node_props?: boolean;
  expand_lib?: boolean;
}
export interface FuncnodesReactFlowLocalSettings {
  view_settings: FuncnodesReactFlowViewSettings;
  update_view_settings: (settings: FuncnodesReactFlowViewSettings) => void;
}

export interface FuncnodesReactFlowLocalState {
  selected_nodes: string[];
  selected_edges: string[];
  selected_groups: string[];
  funcnodescontainerRef: HTMLDivElement | null;
}

export interface FuncNodesReactFlowZustandInterface {
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
  on_node_action: (action: latest.NodeAction) => latest.NodeType | undefined;
  on_edge_action: (edge: EdgeAction) => void;
  on_group_action: (group: GroupAction) => void;
  set_progress: (progress: ProgressState) => void;
  auto_progress: () => void;
  plugins: UseBoundStore<
    StoreApi<{ [key: string]: latest.FuncNodesReactPlugin | undefined }>
  >;
  add_plugin: (name: string, plugin: latest.FuncNodesReactPlugin) => void;
  reactflowRef: HTMLDivElement | null;

  clear_all: () => void;
  center_node: (node_id: string | string[]) => void;
  center_all: () => void;
  dev_settings: DevSettings;
  logger: Logger;
}
