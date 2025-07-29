import { v4 as uuidv4 } from "uuid";
import { deep_merge } from "@/object-helpers";
import { UseBoundStore, StoreApi, create } from "zustand";
import {
  FuncNodesWorkerState,
  WorkerHookProperties,
  WorkerProps,
} from "@/workers";
import {
  NodeSpaceEvent,
  WorkerEvent,
  CmdMessage,
  JSONMessage,
  LargeMessageHint,
} from "@/messages";
import {
  FuncNodesReactFlowZustandInterface,
  latest,
  LibType,
  PackedPlugin,
  ViewState,
  update_nodeview,
  GroupActionUpdate,
  FullState,
} from "@/barrel_imports";
import { NodeGroup, NodeGroups } from "@/groups";
import { interfereDataStructure } from "@/data-structures";

export class FuncNodesWorker {
  messagePromises: Map<string, any>;
  _zustand?: FuncNodesReactFlowZustandInterface;
  _local_nodeupdates: Map<string, latest.PartialSerializedNodeType>;
  _local_groupupdates: Map<string, Partial<NodeGroup>>;
  _nodeupdatetimer: ReturnType<typeof setTimeout>;
  _groupupdatetimer: ReturnType<typeof setTimeout>;
  uuid: string;
  _responsive: boolean;
  private CHUNK_TIMEOUT: number = 10000; // 10 seconds
  private PONGDELAY: number = 2000; // 2 seconds
  private blobChunks: {
    [key: string]: { chunks: (Uint8Array | null)[]; timestamp: number };
  } = {};

  state: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
  on_sync_complete: (worker: FuncNodesWorker) => Promise<void>;
  _hooks: Map<string, ((p: WorkerHookProperties) => Promise<void>)[]> =
    new Map();
  _ns_event_intercepts: Map<
    string,
    ((event: NodeSpaceEvent) => Promise<NodeSpaceEvent>)[]
  > = new Map();

  _last_pong: number;
  _unique_cmd_outs: { [key: string]: Promise<any> | undefined } = {};

  on_error: (error: any) => void;
  constructor(data: WorkerProps) {
    this.uuid = data.uuid;
    this.on_error =
      data.on_error ||
      ((err: any) => {
        this._zustand?.logger.error(err);
      });
    this.messagePromises = new Map();

    this._local_nodeupdates = new Map();
    this._local_groupupdates = new Map();
    this._nodeupdatetimer = setTimeout(() => {
      this.sync_local_node_updates();
    }, 5000);
    this._groupupdatetimer = setTimeout(() => {
      this.sync_local_group_updates();
    }, 5000);
    this.state = create<FuncNodesWorkerState>((_set, _get) => ({
      is_open: false,
    }));
    if (data.zustand) this.set_zustand(data.zustand);

    if (data.on_sync_complete) {
      this.on_sync_complete = data.on_sync_complete;
    } else {
      this.on_sync_complete = async () => {};
    }

    this._responsive = false;
    this._last_pong = Date.now() - this.PONGDELAY * 100; // set the last pong way back in the past
    // send a ping message every 1 seconds
    setInterval(() => {
      if (!this.is_open) return;
      this.send({ type: "ping" });
    }, this.PONGDELAY);

    // regular check if the last pong is less than 5 seconds ago
    setInterval(() => {
      if (Date.now() - this._last_pong > this.PONGDELAY * 3) {
        this._responsive = false;
      } else {
        this._responsive = true;
      }
    }, this.PONGDELAY * 2);

    // Using an arrow function so `this` is lexically bound
    const cleanupChunks = () => {
      const now = Date.now();
      for (const id in this.blobChunks) {
        if (now - this.blobChunks[id].timestamp > this.CHUNK_TIMEOUT) {
          delete this.blobChunks[id];
        }
      }
    };
    setInterval(cleanupChunks, this.CHUNK_TIMEOUT / 2);
  }

  _receive_pong() {
    this._last_pong = Date.now();
    this._responsive = true;
  }

  set_zustand(zustand: FuncNodesReactFlowZustandInterface) {
    if (zustand === this._zustand) return;
    this._zustand = zustand;
    zustand.set_worker(this);
    this._zustand.auto_progress();
    this.stepwise_fullsync();
  }

  add_hook(
    hook: string,
    callback: (p: WorkerHookProperties) => Promise<void>
  ): () => void {
    const hooks = this._hooks.get(hook) || [];
    hooks.push(callback);
    this._hooks.set(hook, hooks);

    const remover = () => {
      const hooks = this._hooks.get(hook) || [];
      const idx = hooks.indexOf(callback);
      if (idx >= 0) {
        hooks.splice(idx, 1);
      }
    };
    return remover;
  }

  async call_hooks(hook: string, data?: any) {
    const promises = [];
    for (const h of this._hooks.get(hook) || []) {
      const p = h({ worker: this, data: data });
      // check if the hook is async
      if (p instanceof Promise) {
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }

  add_ns_event_intercept(
    hook: string,
    callback: (event: NodeSpaceEvent) => Promise<NodeSpaceEvent>
  ): () => void {
    const hooks = this._ns_event_intercepts.get(hook) || [];
    hooks.push(callback);
    this._ns_event_intercepts.set(hook, hooks);

    const remover = () => {
      const hooks = this._ns_event_intercepts.get(hook) || [];
      const idx = hooks.indexOf(callback);
      if (idx >= 0) {
        hooks.splice(idx, 1);
      }
    };
    return remover;
  }

  async intercept_ns_event(event: NodeSpaceEvent) {
    let newevent = event;
    for (const h of this._ns_event_intercepts.get(event.event) || []) {
      newevent = await h(newevent);
    }
    return newevent;
  }

  public get is_open(): boolean {
    return this.state.getState().is_open;
  }
  public set is_open(v: boolean) {
    this.state.setState({ is_open: v });
  }

  async stepwise_fullsync() {
    if (!this._zustand) return;
    if (!this.is_open) return;

    await this.sync_lib();
    await this.sync_external_worker();
    await this.sync_funcnodes_plugins();
    await this.sync_nodespace();
    await this.sync_view_state();

    await this.on_sync_complete(this);
  }

  async sync_lib() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    const resp = await this._send_cmd({
      cmd: "get_library",
      wait_for_response: true,
      retries: 2,
      unique: true,
    });

    this._zustand.lib.libstate.getState().set({
      lib: resp as LibType,
    });
  }

  async sync_external_worker() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    const resp = await this._send_cmd({
      cmd: "get_worker_dependencies",
      wait_for_response: true,
      unique: true,
    });
    this._zustand.lib.libstate.getState().set({
      external_worker: resp as any,
    });
  }

  async sync_funcnodes_plugins() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    const resp = (await this._send_cmd({
      cmd: "get_plugin_keys",
      wait_for_response: true,
      unique: true,
      kwargs: { type: "react" },
    })) as string[];
    for (const key of resp) {
      const plugin: PackedPlugin = await this._send_cmd({
        cmd: "get_plugin",
        wait_for_response: true,
        kwargs: { key, type: "react" },
        unique: true,
      });
      if (plugin.js) {
        for (const js of plugin.js) {
          const scripttag = document.createElement("script");

          scripttag.text = atob(js);

          document.body.appendChild(scripttag);
        }
      }
      if (plugin.css) {
        for (const css of plugin.css) {
          const styletag = document.createElement("style");
          styletag.innerHTML = atob(css);
          document.head.appendChild(styletag);
        }
      }

      if (plugin.module !== undefined) {
        /// import the plugin
        const binaryString = atob(plugin.module);

        // Convert the binary string to a Uint8Array
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert the Uint8Array to a Blob
        const blob = new Blob([bytes], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        const module = await import(/* @vite-ignore */ blobUrl);
        // gc the blob
        URL.revokeObjectURL(blobUrl);

        this._zustand.add_plugin(key, module.default);
      }
    }
  }

  async sync_view_state() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    const resp = (await this._send_cmd({
      cmd: "view_state",
      wait_for_response: true,
      unique: true,
    })) as ViewState;

    if (resp.renderoptions)
      this._zustand.update_render_options(resp.renderoptions);

    const nodeview = resp.nodes;
    if (nodeview) {
      for (const nodeid in nodeview) {
        const partnode: latest.PartialSerializedNodeType = {};
        update_nodeview(partnode, nodeview[nodeid]!);

        this._zustand.on_node_action({
          type: "update",
          node: partnode,
          id: nodeid,
          from_remote: true,
        });
      }
    }
  }

  async sync_nodespace() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    const resp = (await this._send_cmd({
      cmd: "get_nodes",
      kwargs: { with_frontend: true },
      wait_for_response: true,
      unique: true,
    })) as latest.SerializedNodeType[];
    for (const node of resp) {
      this._receive_node_added(node);
    }

    const edges = (await this._send_cmd({
      cmd: "get_edges",
      wait_for_response: true,
      unique: true,
    })) as [string, string, string, string][];

    for (const edge of edges) {
      this._receive_edge_added(...edge);
    }
    const groups = (await this._send_cmd({
      cmd: "get_groups",
      kwargs: {},
      wait_for_response: true,
      unique: true,
    })) as NodeGroups;
    this._receive_groups(groups);
  }

  async fullsync() {
    if (!this._zustand) return;
    if (!this.is_open) return;
    let resp: FullState;
    while (true) {
      try {
        resp = (await this._send_cmd({
          cmd: "full_state",
          unique: true,
        })) as FullState;
        break;
      } catch (e) {
        this._zustand.logger.error("Error in fullsync", e);
      }
    }
    this._zustand.logger.debug("Full state", resp);
    this._zustand.lib.libstate.getState().set({
      lib: resp.backend.lib,
      external_worker: resp.worker_dependencies,
    });
    if (resp.view.renderoptions)
      this._zustand.update_render_options(resp.view.renderoptions);
    const nodeview = resp.view.nodes;
    for (const node of resp.backend.nodes) {
      const _nodeview = nodeview[node.id];
      if (_nodeview !== undefined) {
        update_nodeview(node, _nodeview);
      }
      this._receive_node_added(node);
    }
    for (const edge of resp.backend.edges) {
      this._receive_edge_added(...edge);
    }
    const groups = resp.backend.groups;
    if (groups) {
      this._receive_groups(groups);
    }
  }

  async _receive_edge_added(
    src_nid: string,
    src_ioid: string,
    trg_nid: string,
    trg_ioid: string
  ) {
    if (!this._zustand) return;
    this._zustand.on_edge_action({
      type: "add",
      from_remote: true,
      ...{ src_nid, src_ioid, trg_nid, trg_ioid },
    });
  }

  async _receive_groups(groups: NodeGroups) {
    if (!this._zustand) return;
    this._zustand.on_group_action({
      type: "set",
      groups: groups,
    });
  }

  async trigger_node(node_id: string) {
    await this._send_cmd({
      cmd: "trigger_node",
      kwargs: { nid: node_id },
      wait_for_response: false,
    });
  }

  async add_node(node_id: string) {
    const resp = await this._send_cmd({
      cmd: "add_node",
      kwargs: { id: node_id },
    });
    return this._receive_node_added(resp as latest.SerializedNodeType);
  }

  async remove_node(node_id: string) {
    await this._send_cmd({
      cmd: "remove_node",
      kwargs: { id: node_id },
    });
  }

  async _receive_node_added(data: latest.SerializedNodeType) {
    if (!this._zustand) return;
    return this._zustand.on_node_action({
      type: "add",
      node: data,
      id: data.id,
      from_remote: true,
    });
  }

  add_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
    replace = false,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
    replace?: boolean;
  }) {
    return this._send_cmd({
      cmd: "add_edge",
      kwargs: { src_nid, src_ioid, trg_nid, trg_ioid, replace },
    });
  }

  remove_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
  }) {
    return this._send_cmd({
      cmd: "remove_edge",
      kwargs: { src_nid, src_ioid, trg_nid, trg_ioid },
    });
  }

  async add_external_worker({
    module,
    cls_module,
    cls_name,
  }: {
    module: string;
    cls_module: string;
    cls_name: string;
  }) {
    return await this._send_cmd({
      cmd: "add_external_worker",
      kwargs: { module, cls_module, cls_name },
    });
  }

  sync_local_node_updates() {
    clearTimeout(this._nodeupdatetimer);
    this._local_nodeupdates.forEach(async (node, id) => {
      const ans = await this._send_cmd({
        cmd: "update_node",
        kwargs: { nid: id, data: node },
        wait_for_response: true,
      });
      if (!this._zustand) return;
      this._zustand.on_node_action({
        type: "update",
        node: ans,
        id: id,
        from_remote: true,
      });
    });
    this._local_nodeupdates.clear();
    this._nodeupdatetimer = setTimeout(() => {
      this.sync_local_node_updates();
    }, 200);
  }

  locally_update_node(action: latest.NodeActionUpdate) {
    // Add the type to the parameter
    //log current stack trace
    const currentstate = this._local_nodeupdates.get(action.id);
    if (currentstate) {
      const { new_obj, change } = deep_merge(currentstate, action.node);
      if (change) {
        this._local_nodeupdates.set(action.id, new_obj);
      }
    } else {
      this._local_nodeupdates.set(action.id, action.node);
    }
    if (action.immediate) {
      this.sync_local_node_updates();
    }
  }

  sync_local_group_updates() {
    clearTimeout(this._groupupdatetimer);
    this._local_groupupdates.forEach(async (group, id) => {
      const ans = await this._send_cmd({
        cmd: "update_group",
        kwargs: { gid: id, data: group },
        wait_for_response: true,
      });
      if (!this._zustand) return;
      this._zustand.on_group_action({
        type: "update",
        group: ans,
        id: id,
        from_remote: true,
      });
    });
    this._local_groupupdates.clear();
    this._groupupdatetimer = setTimeout(() => {
      this.sync_local_group_updates();
    }, 200);
  }

  locally_update_group(action: GroupActionUpdate) {
    // Add the type to the parameter
    //log current stack trace
    const currentstate = this._local_groupupdates.get(action.id);
    if (currentstate) {
      const { new_obj, change } = deep_merge(currentstate, action.group);
      if (change) {
        this._local_groupupdates.set(action.id, new_obj);
      }
    } else {
      this._local_groupupdates.set(action.id, action.group);
    }
    if (action.immediate) {
      this.sync_local_group_updates();
    }
  }

  async get_remote_node_state(nid: string) {
    const ans: latest.SerializedNodeType = await this._send_cmd({
      cmd: "get_node_state",
      kwargs: { nid },
      wait_for_response: true,
    });
    if (!this._zustand) return;
    this._zustand.on_node_action({
      type: "update",
      node: ans,
      id: ans.id,
      from_remote: true,
    });
  }

  set_io_value({
    nid,
    ioid,
    value,
    set_default = false,
  }: {
    nid: string;
    ioid: string;
    value: any;
    set_default: boolean;
  }) {
    return this._send_cmd({
      cmd: "set_io_value",
      kwargs: { nid, ioid, value, set_default },
      wait_for_response: true,
    });
  }

  clear() {
    return this._send_cmd({ cmd: "clear", unique: true });
  }

  save() {
    return this._send_cmd({
      cmd: "save",
      wait_for_response: true,
      unique: true,
    });
  }

  load(data: any) {
    return this._send_cmd({
      cmd: "load_data",
      kwargs: { data },
      wait_for_response: true,
    }).then(() => {
      this.stepwise_fullsync();
    });
  }

  async get_io_value({ nid, ioid }: { nid: string; ioid: string }) {
    const res = await this._send_cmd({
      cmd: "get_io_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
    });

    if (!this._zustand) return res;
    this._zustand.on_node_action({
      type: "update",
      node: {
        io: {
          [ioid]: {
            value: res,
          },
        },
      },
      id: nid,
      from_remote: true,
    });
    return res;
  }

  async get_ios_values({ nid }: { nid: string }) {
    const res: { [ioid: string]: any } = await this._send_cmd({
      cmd: "get_ios_values",
      kwargs: { nid },
      wait_for_response: true,
    });

    if (!this._zustand) return res;

    const mappedres: { [ioid: string]: { value: any } } = {};
    for (const ioid in res) {
      mappedres[ioid] = { value: res[ioid] };
    }

    this._zustand.on_node_action({
      type: "update",
      node: {
        io: mappedres,
      },
      id: nid,
      from_remote: true,
    });
    return res;
  }

  async get_runstate() {
    const res = await this._send_cmd({
      cmd: "get_runstate",
      wait_for_response: true,
      unique: true,
    });
    return res;
  }

  async _send_cmd({
    cmd,
    kwargs,
    as_bytes = false,
    wait_for_response = true,
    response_timeout = 5000,
    retries = 2,
    unique = false,
  }: {
    cmd: string;
    kwargs?: any;
    wait_for_response?: boolean;
    response_timeout?: number;
    as_bytes?: boolean;
    retries?: number;
    unique?: boolean;
  }) {
    const msg: CmdMessage = {
      type: "cmd",
      as_bytes: as_bytes,
      cmd,
      kwargs: kwargs || {},
    };

    await new Promise<void>(async (resolve) => {
      if (this._responsive) return resolve();
      const interval = setInterval(() => {
        if (this._responsive) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    if (wait_for_response) {
      if (unique && this._unique_cmd_outs[msg.cmd] !== undefined) {
        return this._unique_cmd_outs[msg.cmd];
      }
      if (retries < 0) retries = 0;
      const wait_for_response_callback = async (): Promise<any> => {
        let response;
        while (retries >= 0) {
          const msid = msg.id || uuidv4();
          msg.id = msid;
          const promise = new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject("Timeout@wait_for_response for " + cmd);
            }, response_timeout);
            this.messagePromises.set(msid, {
              resolve: (data: any) => {
                clearTimeout(timeout);
                resolve(data);
                this.messagePromises.delete(msid);
              },
              reject: (err: any) => {
                clearTimeout(timeout);
                reject(err);
                this.messagePromises.delete(msid);
              },
            });
          });
          await this.send(msg);
          try {
            response = await promise;
            break;
          } catch (e) {
            if (retries === 0) {
              delete this._unique_cmd_outs[msg.cmd];
              throw e;
            }
            retries -= 1;
            continue;
          }
        }
        delete this._unique_cmd_outs[msg.cmd];

        return response;
      };

      const awaiter = wait_for_response_callback();

      if (unique) this._unique_cmd_outs[msg.cmd] = awaiter;

      return awaiter;
    }
    return this.send(msg);
  }

  async send(_data: any) {
    // this is the abstract method that should be implemented by subclasses
    throw new Error("async send(data: any)  not implemented");
  }

  async upload_file({
    files: _files,
    onProgressCallback: _onProgressCallback,
    root: _root,
  }: {
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

  async receive_workerevent({ event, data }: WorkerEvent) {
    switch (event) {
      case "worker_error":
        if (!this._zustand) return;
        return this._zustand.logger.error(data.error);
      case "update_worker_dependencies":
        if (!this._zustand) return;
        return this._zustand.lib.libstate.getState().set({
          external_worker: data.worker_dependencies,
        });
      case "lib_update":
        await this.sync_lib();
        return;
      case "fullsync":
        await this.stepwise_fullsync();
        return;
      case "external_worker_update":
        await this.sync_lib();
        await this.sync_external_worker();
        return;

      case "starting":
        this.call_hooks("starting");
        return;
      case "stopping":
        this.call_hooks("stopping");
        return;
      default:
        console.warn("Unhandled worker event", event, data);
        break;
    }
  }

  async receive_nodespace_event(ns_event: NodeSpaceEvent) {
    const { event, data } = await this.intercept_ns_event(ns_event);

    switch (event) {
      case "after_set_value":
        if (!this._zustand) return;
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            io: {
              [data.io]: {
                value: data.result,
              },
            },
          },
          id: data.node,
          from_remote: true,
        });
      case "after_update_value_options":
        if (!this._zustand) return;
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            io: {
              [data.io]: {
                value_options: data.result,
              },
            },
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerstart":
        if (!this._zustand) return;
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: true,
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerdone":
        if (!this._zustand) return;
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: false,
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerfast":
        if (!this._zustand) return;
        this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: true,
          },
          id: data.node,
          from_remote: true,
        });
        setTimeout(() => {
          if (!this._zustand) return;
          this._zustand.on_node_action({
            type: "update",
            node: {
              id: data.node,
              in_trigger: false,
            },
            id: data.node,
            from_remote: true,
          });
        }, 50);
        return;

      case "node_trigger_error":
        if (!this._zustand) return;
        return this._zustand.on_node_action({
          type: "error",
          errortype: "trigger",
          error: data.error,
          id: data.node,
          tb: data.tb,
          from_remote: true,
        } as latest.NodeActionError);

      case "node_removed":
        if (!this._zustand) return;
        this._zustand.on_node_action({
          type: "delete",
          id: data.node,
          from_remote: true,
        });
        this.call_hooks("node_removed", { node: data.node });
        return;

      case "node_added":
        this._receive_node_added(data.node as latest.SerializedNodeType);
        return;

      case "after_disconnect":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        if (!this._zustand) return;
        return this._zustand.on_edge_action({
          type: "delete",
          from_remote: true,
          src_nid: data.result[0],
          src_ioid: data.result[1],
          trg_nid: data.result[2],
          trg_ioid: data.result[3],
        });
      case "after_unforward":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        if (!this._zustand) return;
        return this._zustand.on_edge_action({
          type: "delete",
          from_remote: true,
          src_nid: data.result[0],
          src_ioid: data.result[1],
          trg_nid: data.result[2],
          trg_ioid: data.result[3],
        });

      case "after_connect":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        return this._receive_edge_added(
          ...(data.result as [string, string, string, string])
        );

      case "after_forward":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        return this._receive_edge_added(
          ...(data.result as [string, string, string, string])
        );

      case "after_add_shelf":
        if (!data.result) return;
        if (!this._zustand) return;
        return this._zustand.lib.libstate.getState().set({
          lib: data.result,
        });
      case "after_remove_shelf":
        if (!data.result) return;
        if (!this._zustand) return;
        return this._zustand.lib.libstate.getState().set({
          lib: data.result,
        });

      case "progress":
        if (!this._zustand) return;
        if (data.node) {
          return this._zustand.on_node_action({
            type: "update",
            node: {
              id: data.node,
              progress: data.info,
            },
            id: data.node,
            from_remote: true,
          });
        }
        console.warn("Unhandled nodepsace event", event, data);

        break;

      default:
        const ignored_events = ["after_set_nodespace"];
        if (ignored_events.includes(event)) return;
        console.warn("Unhandled nodepsace event", event, data);
        break;
    }
  }

  async add_lib(lib: string, release: string) {
    const ans = await this._send_cmd({
      cmd: "add_package_dependency",
      kwargs: { name: lib, version: release },
      wait_for_response: false,
    });
    return ans;
  }

  async remove_lib(lib: string) {
    const ans = await this._send_cmd({
      cmd: "remove_package_dependency",
      kwargs: { name: lib },
      wait_for_response: false,
    });
    return ans;
  }

  async receive(data: JSONMessage) {
    let promise;
    this._last_pong = Date.now();
    this._responsive = true;
    switch (data.type) {
      case "pong":
        this._receive_pong();
        return;
      case "nsevent":
        return await this.receive_nodespace_event(data);
      case "result":
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.resolve(data.result);
        }
        break;
      case "error":
        this.on_error(data.tb + "\n" + data.error);
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.reject(data.error);
        }
        break;
      case "progress":
        if (!this._zustand) return;
        this._zustand.set_progress(data);
        break;

      case "workerevent":
        return await this.receive_workerevent(data);

      case "large_message":
        return await this.handle_large_message_hint(data);
      default:
        console.warn("Unhandled message", data);
        break;
    }
  }

  async onbytes(data: Uint8Array) {
    try {
      const headerStr = new TextDecoder("utf-8").decode(data);

      const headerEndIndex = headerStr.indexOf("\r\n\r\n");
      if (headerEndIndex === -1) {
        console.error("Header terminator not found for:\n", headerStr);
        return;
      }
      const header = headerStr.substring(0, headerEndIndex + 4);
      const bytes_wo_header = data.slice(headerEndIndex + 4);
      //header are key value pairs i teh form of k1=v1;k2=v2; k3=v3; ...
      const headerArr = header.split(";");
      const headerObj: { [key: string]: string } = {};
      headerArr.forEach((h) => {
        const [key, value] = h.split("=");
        headerObj[key.trim()] = value.trim();
      });

      //make sure the header has the required fields
      //chunk=1/1;msgid=1d156acd-772f-400c-b023-09111e8643ea;type=io_value; mime=application/json; node=fcc5c2878500436aad0343854db51ac1; io=imagedata
      if (!headerObj.chunk || !headerObj.msgid) {
        console.error(
          "Header missing required fields chunk or msgid",
          headerObj
        );
        return;
      }

      const [chunk, total] = headerObj.chunk.split("/");
      const msgid = headerObj.msgid;

      //if chunk is 1/1, then this is the only chunk
      if (chunk === "1" && total === "1") {
        return this.recieve_bytes(headerObj, bytes_wo_header);
      }

      if (!this.blobChunks[msgid]) {
        this.blobChunks[msgid] = {
          chunks: Array.from({ length: parseInt(total) }, () => null),
          timestamp: Date.now(),
        };
      }

      if (this.blobChunks[msgid].chunks.length !== parseInt(total)) {
        console.error("Total chunks mismatch");
        return;
      }

      this.blobChunks[msgid].chunks[parseInt(chunk) - 1] = data;

      //check if all chunks are recieved
      if (this.blobChunks[msgid].chunks.every((c) => c !== null)) {
        const fullBytes = new Uint8Array(
          this.blobChunks[msgid].chunks.reduce((acc, chunk) => {
            return acc.concat(Array.from(chunk));
          }, [] as number[])
        );
        this.recieve_bytes(headerObj, fullBytes);
        delete this.blobChunks[msgid];
      }
    } catch (e) {
      console.error("Websocketworker: onbytes error", e, data);
      return;
    }
  }

  async recieve_bytes(
    headerObj: { [key: string]: string | undefined },
    bytes: Uint8Array
  ) {
    const { type } = headerObj;

    if (type === "io_value") {
      if (!this._zustand) return;
      const { node, io, preview, mime } = headerObj;
      const valuekey = preview ? "value" : "fullvalue";
      if (!node || !io) console.error("Invalid io_value message", headerObj);
      const ds = interfereDataStructure({
        data: bytes,
        mime: mime || "application/octet-stream",
      });
      // console.log("Received bytes", "Header:", headerObj, "Datastructure:", ds);
      this._zustand.on_node_action({
        type: "update",
        node: {
          id: node!,
          io: {
            [io!]: {
              [valuekey]: ds,
            },
          },
        },
        id: node!,
        from_remote: true,
      });
    } else if (type == "result") {
      const promise = headerObj.id && this.messagePromises.get(headerObj.id);
      if (promise) {
        promise.resolve({ bytes, header: headerObj });
      }
    } else {
      console.warn("Unhandled bytes message", headerObj);
    }
  }

  disconnect() {}

  onclose() {
    this.is_open = false;
    if (!this._zustand) return;
    this._zustand.auto_progress();
  }

  async reconnect() {}

  async stop() {
    await this._send_cmd({ cmd: "stop_worker", wait_for_response: false });
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

  async get_io_full_value({ nid, ioid }: { nid: string; ioid: string }) {
    const res = await this._send_cmd({
      cmd: "get_io_full_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
      as_bytes: true,
    });

    if (!this._zustand) return res;

    if (!this._zustand) return;
    const { header, bytes } = res;

    const { mime } = header;
    const ds = interfereDataStructure({
      data: bytes,
      mime: mime || "application/octet-stream",
    });

    this._zustand.on_node_action({
      type: "update",
      node: {
        id: nid,
        io: {
          [ioid]: {
            fullvalue: ds,
          },
        },
      },
      id: nid,
      from_remote: true,
    });

    // this._zustand.on_node_action({
    //   type: "update",
    //   node: {
    //     io: {
    //       [ioid]: {
    //         fullvalue: res,
    //       },
    //     },
    //   },
    //   id: nid,
    //   from_remote: true,
    // });
    return res;
  }

  async update_io_options({
    nid,
    ioid,
    options,
  }: {
    nid: string;
    ioid: string;
    options: latest.UpdateableIOOptions;
  }) {
    const res = await this._send_cmd({
      cmd: "update_io_options",
      kwargs: { nid, ioid, ...options },
      wait_for_response: true,
    });

    if (!this._zustand) return res;
    this._zustand.on_node_action({
      type: "update",
      node: {
        io: {
          [ioid]: {
            ...options,
          },
        },
      },
      id: nid,
      from_remote: true,
    });
  }

  async get_node_status(nid: string) {
    const res = await this._send_cmd({
      cmd: "get_node_state",
      kwargs: { nid },
      wait_for_response: true,
    });
    return res;
  }

  async get_available_modules() {
    const res = await this._send_cmd({
      cmd: "get_available_modules",
      wait_for_response: true,
      unique: true,
    });
    return res;
  }

  async update_external_worker(
    worker_id: string,
    class_id: string,
    data: {
      name?: string;
    }
  ) {
    const res = await this._send_cmd({
      cmd: "update_external_worker",
      kwargs: { worker_id, class_id, ...data },
      wait_for_response: true,
    });
    return res;
  }

  async remove_external_worker(worker_id: string, class_id: string) {
    const res = await this._send_cmd({
      cmd: "remove_external_worker",
      kwargs: { worker_id, class_id },
      wait_for_response: true,
    });
    return res;
  }

  async export({ withFiles = false }: { withFiles: boolean }) {
    const res = await this._send_cmd({
      cmd: "export_worker",
      wait_for_response: true,
      kwargs: { with_files: withFiles },
    });
    return res;
  }

  async update_from_export(data: string) {
    const centerhook = this.add_hook("node_added", async ({}) => {
      this._zustand?.center_all();
    });
    try {
      const res = await this._send_cmd({
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
      await this.stepwise_fullsync();
      return res;
    } finally {
      centerhook();
    }
  }

  async group_nodes(nodeIds: string[], group_ids: string[]) {
    // This sends a command to the backend Python worker
    // The backend should implement a handler for the "group_nodes" command
    const res = (await this._send_cmd({
      cmd: "group_nodes",
      kwargs: { node_ids: nodeIds, group_ids: group_ids },
      wait_for_response: true,
    })) as NodeGroups;
    this._receive_groups(res);
    return res;
  }

  async remove_group(gid: string) {
    console.log("remove_group", gid);
    await this._send_cmd({
      cmd: "remove_group",
      kwargs: { gid: gid },
      wait_for_response: true,
    });
    await this.sync_nodespace();
  }
}
