import { FuncnodesReactFlowProps } from "@/app";

import { isDevelopment } from "@/utils/debugger";
import { ConsoleLogger, DEBUG, INFO, Logger } from "@/utils/logger";

import { UseBoundStore, StoreApi } from "zustand";
import { NodeSpaceManager } from "./handler/nodespace-manager";
import { LibManager } from "./handler/lib-manager";
import { WorkerManagerHandler } from "./handler/worker-manager";

import {
  FuncnodesReactFlowLocalSettings,
  FuncnodesReactFlowLocalState,
  FuncnodesReactFlowViewSettings,
  StateManagerHandler,
} from "./handler/state-manager";
import { PluginManagerHandler } from "./handler/plugin-manager";
import { ReactFlowManagerHandler } from "./handler/rf-manager";
import { LibZustandInterface } from "@/library";
import {
  FuncNodesWorker,
  FuncNodesWorkerState,
  WorkerManager,
  WorkersState,
} from "@/workers";

import { ProgressState, RFStore } from "./states";
import { RenderOptions } from "@/data-rendering-types";
import { useReactFlow } from "@xyflow/react";
import { NodeType } from "@/nodes-core";
import { EdgeAction, GroupAction, NodeAction } from "./actions";
import { FuncNodesReactPlugin } from "@/plugins";
import { NodeSpaceZustandInterface } from "@/nodespace";

export interface FuncNodesReactFlowZustandInterface {
  options: FuncnodesReactFlowProps;
  local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
  update_view_settings: (settings: FuncnodesReactFlowViewSettings) => void;
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
  on_node_action: (action: NodeAction) => NodeType | undefined;
  on_edge_action: (edge: EdgeAction) => void;
  on_group_action: (group: GroupAction) => void;
  set_progress: (progress: ProgressState) => void;
  auto_progress: () => void;
  plugins: UseBoundStore<
    StoreApi<{ [key: string]: FuncNodesReactPlugin | undefined }>
  >;
  add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
  reactflowRef: HTMLDivElement | null;

  clear_all: () => void;
  center_node: (node_id: string | string[]) => void;
  center_all: () => void;
  dev_settings: DevSettings;
  logger: Logger;
}

export interface DevSettings {
  debug: boolean;
}

export class FuncNodesReactFlow implements FuncNodesReactFlowZustandInterface {
  public options: FuncnodesReactFlowProps;
  public reactflowRef: HTMLDivElement | null = null;

  public logger: Logger;
  public dev_settings: DevSettings = {
    debug: isDevelopment(),
  };

  private _nodespaceManager: NodeSpaceManager;
  private _libManager: LibManager;
  private _workerManager: WorkerManagerHandler;
  private _stateManager: StateManagerHandler;
  private _pluginManager: PluginManagerHandler;
  private _reactFlowManager: ReactFlowManagerHandler;

  constructor(props: FuncnodesReactFlowProps) {
    this.options = props;
    this.logger =
      props.logger ?? new ConsoleLogger("fn", isDevelopment() ? DEBUG : INFO);
    const handlerContext = { rf: this };
    this._nodespaceManager = new NodeSpaceManager(handlerContext);
    this._libManager = new LibManager(handlerContext);
    this._workerManager = new WorkerManagerHandler(handlerContext);
    this._stateManager = new StateManagerHandler(handlerContext);
    this._pluginManager = new PluginManagerHandler(handlerContext);
    this._reactFlowManager = new ReactFlowManagerHandler(handlerContext);
  }

  // #region handlers
  getNodespaceManager() {
    return this._nodespaceManager;
  }
  getLibManager() {
    return this._libManager;
  }
  getWorkerManager() {
    return this._workerManager;
  }
  getStateManager() {
    return this._stateManager;
  }
  getPluginManager() {
    return this._pluginManager;
  }
  getReactFlowManager() {
    return this._reactFlowManager;
  }
  // #endregion handlers

  // #region nodespace manager
  get nodespace() {
    return this._nodespaceManager.nodespace;
  }
  get on_node_action() {
    return this._nodespaceManager.on_node_action.bind(this._nodespaceManager);
  }
  get on_edge_action() {
    return this._nodespaceManager.on_edge_action.bind(this._nodespaceManager);
  }
  get on_group_action() {
    return this._nodespaceManager.on_group_action.bind(this._nodespaceManager);
  }
  get clear_all() {
    return this._nodespaceManager.clear_all.bind(this._nodespaceManager);
  }
  get center_node() {
    return this._nodespaceManager.center_node.bind(this._nodespaceManager);
  }
  get center_all() {
    return this._nodespaceManager.center_all.bind(this._nodespaceManager);
  }
  // #endregion nodespace manager

  // #region lib manager
  get lib() {
    return this._libManager.lib;
  }

  // #endregion lib manager

  // #region worker manager
  get set_worker() {
    return this._workerManager.set_worker.bind(this._workerManager);
  }

  get workermanager() {
    return this._workerManager.workermanager;
  }
  set workermanager(manager: WorkerManagerHandler["workermanager"]) {
    this._workerManager.workermanager = manager;
  }

  get worker() {
    return this._workerManager.worker;
  }

  get workers() {
    return this._workerManager.workers;
  }

  get workerstate() {
    return this._workerManager.workerstate;
  }

  get _unsubscribeFromWorker() {
    return this._workerManager._unsubscribeFromWorker?.bind(
      this._workerManager
    );
  }

  // #endregion worker manager

  // #region statemanager

  get set_progress() {
    return this._stateManager.set_progress.bind(this._stateManager);
  }
  get auto_progress() {
    return this._stateManager.auto_progress.bind(this._stateManager);
  }

  get progress_state() {
    return this._stateManager.progress_state;
  }

  get local_settings() {
    return this._stateManager.local_settings;
  }
  get local_state() {
    return this._stateManager.local_state;
  }
  update_view_settings(settings: FuncnodesReactFlowViewSettings) {
    this._stateManager.update_view_settings(settings);
  }

  // #endregion statemanager

  // #region plugis

  get plugins() {
    return this._pluginManager.plugins.bind(this._pluginManager);
  }
  get add_plugin() {
    return this._pluginManager.add_plugin.bind(this._pluginManager);
  }

  get add_packed_plugin() {
    return this._pluginManager.add_packed_plugin.bind(this._pluginManager);
  }

  get render_options() {
    return this._pluginManager.render_options.bind(this._pluginManager);
  }
  get update_render_options() {
    return this._pluginManager.update_render_options.bind(this._pluginManager);
  }

  // #endregion plugis

  // #region reactflow
  get useReactFlowStore() {
    return this._reactFlowManager.useReactFlowStore.bind(
      this._reactFlowManager
    );
  }

  get rf_instance() {
    return this._reactFlowManager.rf_instance;
  }

  set rf_instance(instance: ReactFlowManagerHandler["rf_instance"]) {
    this._reactFlowManager.rf_instance = instance;
  }

  // #endregion reactflow
}
