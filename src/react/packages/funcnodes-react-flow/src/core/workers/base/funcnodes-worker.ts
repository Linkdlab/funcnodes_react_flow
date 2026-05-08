import { create } from "zustand";
import type { UseBoundStore, StoreApi } from "zustand";
import type { FuncNodesWorkerState, WorkerProps } from "./worker.types";
import type { LargeMessageHint } from "@/messages";

import { WorkerConnectionHealthManager } from "./handlers/connection-health-manager";
import { WorkerSyncManager } from "./handlers/sync-manager";
import { WorkerCommunicationManager } from "./handlers/communication-manager";
import { WorkerEventManager } from "./handlers/event-manager";
import { WorkerHookManager } from "./handlers/hook-manager";
import type { WorkerHookManagerAPI } from "./handlers/hook-manager";
import { WorkerNodeManager } from "./handlers/node-manager";
import type { WorkerNodeManagerAPI } from "./handlers/node-manager";
import { WorkerEdgeManager } from "./handlers/edge-manager";
import type { WorkerEdgeManagerAPI } from "./handlers/edge-manager";
import { WorkerGroupManager } from "./handlers/group-manager";
import type { WorkerGroupManagerAPI } from "./handlers/group-manager";
import { WorkerLibraryManager } from "./handlers/library-manager";
import type { WorkerLibraryManagerAPI } from "./handlers/library-manager";
import type { FuncNodesReactFlow } from "@/funcnodes-context";
import type {
  AutostartPolicy,
  WorkerRepresentation,
} from "../manager/worker-manager.types";
import { loadWorkerData } from "./funcnodes-worker.load";

export type WorkerAPI = {
  node: WorkerNodeManagerAPI;
  group: WorkerGroupManagerAPI;
  edge: WorkerEdgeManagerAPI;
  hooks: WorkerHookManagerAPI;
  lib: WorkerLibraryManagerAPI;
};

export class FuncNodesWorker {
  _zustand?: FuncNodesReactFlow;

  uuid: string;

  private _connectionhealthManager: WorkerConnectionHealthManager;
  private _communicationManager: WorkerCommunicationManager;
  private _eventManager: WorkerEventManager;
  private _syncManager: WorkerSyncManager;
  private _hookManager: WorkerHookManager;
  private _nodeManager: WorkerNodeManager;
  private _edgeManager: WorkerEdgeManager;
  private _groupManager: WorkerGroupManager;
  private _libraryManager: WorkerLibraryManager;
  // Public getter for handlers to access eventManager
  public getEventManager(): WorkerEventManager {
    return this._eventManager;
  }
  public getSyncManager(): WorkerSyncManager {
    return this._syncManager;
  }
  public getCommunicationManager(): WorkerCommunicationManager {
    return this._communicationManager;
  }
  public getConnectionHealthManager(): WorkerConnectionHealthManager {
    return this._connectionhealthManager;
  }
  public getHookManager(): WorkerHookManager {
    return this._hookManager;
  }
  public getNodeManager(): WorkerNodeManager {
    return this._nodeManager;
  }
  public getEdgeManager(): WorkerEdgeManager {
    return this._edgeManager;
  }
  public getGroupManager(): WorkerGroupManager {
    return this._groupManager;
  }
  public getLibraryManager(): WorkerLibraryManager {
    return this._libraryManager;
  }
  state: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
  public readonly api: WorkerAPI;
  on_error: (error: any) => void;
  constructor(data: WorkerProps) {
    this.uuid = data.uuid;
    this.on_error =
      data.on_error ||
      ((err: any) => {
        this._zustand?.logger.error(err);
      });

    this.state = create<FuncNodesWorkerState>((_set, _get) => ({
      is_open: false,
    }));

    // --- Initialize Handlers ---
    const handlerContext = { worker: this };

    this._connectionhealthManager = new WorkerConnectionHealthManager(
      handlerContext
    );
    this._communicationManager = new WorkerCommunicationManager(handlerContext);
    this._eventManager = new WorkerEventManager({
      ...handlerContext,
    });
    this._syncManager = new WorkerSyncManager({
      ...handlerContext,
      on_sync_complete: data.on_sync_complete,
    });
    this._hookManager = new WorkerHookManager(handlerContext);
    this._nodeManager = new WorkerNodeManager(handlerContext);
    this._edgeManager = new WorkerEdgeManager(handlerContext);
    this._groupManager = new WorkerGroupManager(handlerContext);
    this._libraryManager = new WorkerLibraryManager(handlerContext);
    this._communicationManager.start();
    this._connectionhealthManager.start();
    this._syncManager.start();
    this._eventManager.start();
    this._hookManager.start();
    this._nodeManager.start();
    this._edgeManager.start();
    this._groupManager.start();
    this._libraryManager.start();
    if (data.zustand) this.set_zustand(data.zustand);
    this.api = {
      node: this._nodeManager,
      group: this._groupManager,
      edge: this._edgeManager,
      hooks: this._hookManager,
      lib: this._libraryManager,
    };
  }

  set_zustand(zustand: FuncNodesReactFlow) {
    if (zustand === this._zustand) return;
    zustand.logger.debug("Setting zustand for worker");
    this._zustand = zustand;
    zustand.set_worker(this);
    this._zustand.auto_progress();
    this._syncManager.stepwise_fullsync();
  }

  public get is_open(): boolean {
    return this.state.getState().is_open;
  }
  public set is_open(v: boolean) {
    this.state.setState({ is_open: v });
  }

  public get is_responsive(): boolean {
    return this._connectionhealthManager.isResponsive();
  }

  clear() {
    return this._communicationManager._send_cmd({ cmd: "clear", unique: true });
  }

  save() {
    return this._communicationManager._send_cmd({
      cmd: "save",
      wait_for_response: true,
      unique: true,
    });
  }

  /**
   * Replace the worker graph from serialized data and resync from the root path.
   */
  load(data: any) {
    return loadWorkerData({
      data,
      resetNodeSpacePath: () => this._zustand?.reset_nodespace_path(),
      sendCommand: (params) => this._communicationManager._send_cmd(params),
      fullSync: () => this._syncManager.stepwise_fullsync(),
    });
  }

  async get_runstate() {
    const res = await this._communicationManager._send_cmd({
      cmd: "get_runstate",
      wait_for_response: true,
      unique: true,
    });
    return res;
  }

  async get_config(): Promise<WorkerRepresentation> {
    const res = await this._communicationManager._send_cmd({
      cmd: "get_config",
      wait_for_response: true,
      unique: true,
    });
    return res;
  }

  async update_settings({
    name,
    autostart,
    update_on_startup,
  }: {
    name?: string;
    autostart?: AutostartPolicy;
    update_on_startup?: Record<string, boolean>;
  }): Promise<WorkerRepresentation> {
    const res = await this._communicationManager._send_cmd({
      cmd: "update_worker_config",
      kwargs: { name, autostart, update_on_startup },
      wait_for_response: true,
    });
    return res;
  }

  async send(_data: any) {
    // this is the abstract method that should be implemented by subclasses
    throw new Error("async send(data: any)  not implemented");
  }

  async upload_file(_params: {
    files: File[] | FileList;
    onProgressCallback?: (loaded: number, total?: number) => void;
    root?: string;
  }): Promise<string> {
    throw new Error("upload_file not implemented ");
  }

  async handle_large_message_hint({}: LargeMessageHint) {
    throw new Error(
      "async handle_large_message_hint({}: LargeMessageHint) not implemented "
    );
  }

  disconnect() {}

  onclose() {
    this.is_open = false;
    if (!this._zustand) return;
    this._zustand.auto_progress();
  }

  async reconnect() {}

  async stop() {
    const active_worker = window.localStorage.getItem("funcnodes__active_worker");
    if (active_worker == this.uuid) {
      window.localStorage.removeItem("funcnodes__active_worker");
    }
    await this._communicationManager._send_cmd({
      cmd: "stop_worker",
      wait_for_response: false,
    });
    const oldonclose = this.onclose.bind(this);
    this.onclose = () => {
      oldonclose();
      if (!this._zustand) return;
      if (this._zustand.worker === this) {
        this._zustand.clear_all();
      }
      this.onclose = oldonclose;
    };
  }

  async update_external_worker(
    worker_id: string,
    class_id: string,
    data: {
      name?: string;
      config?: Record<string, any>;
    }
  ) {
    const res = await this._communicationManager._send_cmd({
      cmd: "update_external_worker",
      kwargs: { worker_id, class_id, ...data },
      wait_for_response: true,
    });
    return res;
  }

  async export({ withFiles = false }: { withFiles: boolean }) {
    const res = await this._communicationManager._send_cmd({
      cmd: "export_worker",
      wait_for_response: true,
      kwargs: { with_files: withFiles },
    });
    return res;
  }

  async update_from_export(data: string) {
    const centerhook = this._hookManager.add_hook("node_added", async ({}) => {
      this._zustand?.center_all();
    });
    try {
      const res = await this._communicationManager._send_cmd({
        cmd: "update_from_export",
        kwargs: { data },
        wait_for_response: true,
        response_timeout: 10 * 60 * 1000, // 10 minutes
        unique: true,
      });
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      await this._syncManager.stepwise_fullsync();
      return res;
    } finally {
      centerhook();
    }
  }

  /**
   * @deprecated This method is deprecated. Use the API or getCommunicationManager()._send_cmd directly instead.
   */
  _send_cmd(params: Parameters<WorkerCommunicationManager["_send_cmd"]>[0]) {
    return this._communicationManager._send_cmd(params);
  }

  /**
   * @deprecated This method is deprecated. Use the API or getNodeManager().set_io_value directly instead.
   */
  set_io_value(params: Parameters<WorkerNodeManagerAPI["set_io_value"]>[0]) {
    return this._nodeManager.set_io_value(params);
  }

  /**
   * @deprecated This method is deprecated. Use the API or getNodeManager().get_io_value directly instead.
   */
  get_io_value(params: Parameters<WorkerNodeManagerAPI["get_io_value"]>[0]) {
    return this._nodeManager.get_io_value(params);
  }
}
