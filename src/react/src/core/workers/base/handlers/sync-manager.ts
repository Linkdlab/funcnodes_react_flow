import {
  WorkerHandlerContext,
  AbstractWorkerHandler,
} from "./worker-handlers.types";
import { FuncNodesWorker } from "../funcnodes-worker";
import {
  FullState,
  GroupActionUpdate,
  latest,
  LibType,
  PackedPlugin,
  update_nodeview,
  ViewState,
} from "@/barrel_imports";
import { NodeGroup, NodeGroups } from "@/groups";
import { deep_merge } from "@/object-helpers";

interface WorkerSyncManagerContext extends WorkerHandlerContext {
  on_sync_complete: ((worker: FuncNodesWorker) => Promise<void>) | undefined;
}

export class WorkerSyncManager extends AbstractWorkerHandler {
  on_sync_complete: (worker: FuncNodesWorker) => Promise<void>;
  _nodeupdatetimer: ReturnType<typeof setTimeout> | undefined;
  _local_nodeupdates: Map<string, latest.PartialSerializedNodeType> = new Map();
  _local_groupupdates: Map<string, Partial<NodeGroup>> = new Map();
  _groupupdatetimer: ReturnType<typeof setTimeout> | undefined;
  constructor(context: WorkerSyncManagerContext) {
    super(context);
    this.on_sync_complete = context.on_sync_complete || (async () => {});
  }

  public start(): void {
    this._nodeupdatetimer = setTimeout(() => {
      this.sync_local_node_updates();
    }, 5000);
    this._groupupdatetimer = setTimeout(() => {
      this.sync_local_group_updates();
    }, 5000);
  }
  public stop(): void {
    if (this._nodeupdatetimer) clearTimeout(this._nodeupdatetimer);
    if (this._groupupdatetimer) clearTimeout(this._groupupdatetimer);
  }

  async stepwise_fullsync() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;

    await this.sync_lib();
    await this.sync_external_worker();
    await this.sync_funcnodes_plugins();
    await this.sync_nodespace();
    await this.sync_view_state();

    await this.on_sync_complete(this.context.worker);
  }

  async sync_lib() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    const resp = await this.communicationManager._send_cmd({
      cmd: "get_library",
      wait_for_response: true,
      retries: 2,
      unique: true,
    });

    this.context.worker._zustand.lib.libstate.getState().set({
      lib: resp as LibType,
    });
  }

  async sync_external_worker() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    const resp = await this.communicationManager._send_cmd({
      cmd: "get_worker_dependencies",
      wait_for_response: true,
      unique: true,
    });
    this.context.worker._zustand.lib.libstate.getState().set({
      external_worker: resp as any,
    });
  }

  async sync_funcnodes_plugins() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    const resp = (await this.context.worker
      .getCommunicationManager()
      ._send_cmd({
        cmd: "get_plugin_keys",
        wait_for_response: true,
        unique: true,
        kwargs: { type: "react" },
      })) as string[];
    for (const key of resp) {
      const plugin: PackedPlugin = await this.context.worker
        .getCommunicationManager()
        ._send_cmd({
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

        this.context.worker._zustand.add_plugin(key, module.default);
      }
    }
  }

  async sync_view_state() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    const resp = (await this.context.worker
      .getCommunicationManager()
      ._send_cmd({
        cmd: "view_state",
        wait_for_response: true,
        unique: true,
      })) as ViewState;

    if (resp.renderoptions)
      this.context.worker._zustand.update_render_options(resp.renderoptions);

    const nodeview = resp.nodes;
    if (nodeview) {
      for (const nodeid in nodeview) {
        const partnode: latest.PartialSerializedNodeType = {};
        update_nodeview(partnode, nodeview[nodeid]!);

        this.context.worker._zustand.on_node_action({
          type: "update",
          node: partnode,
          id: nodeid,
          from_remote: true,
        });
      }
    }
  }

  async sync_nodespace() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    const resp = (await this.context.worker
      .getCommunicationManager()
      ._send_cmd({
        cmd: "get_nodes",
        kwargs: { with_frontend: true },
        wait_for_response: true,
        unique: true,
      })) as latest.SerializedNodeType[];
    for (const node of resp) {
      this.eventManager._receive_node_added(node);
    }

    const edges = (await this.context.worker
      .getCommunicationManager()
      ._send_cmd({
        cmd: "get_edges",
        wait_for_response: true,
        unique: true,
      })) as [string, string, string, string][];

    for (const edge of edges) {
      this.eventManager._receive_edge_added(...edge);
    }
    const groups = (await this.context.worker
      .getCommunicationManager()
      ._send_cmd({
        cmd: "get_groups",
        kwargs: {},
        wait_for_response: true,
        unique: true,
      })) as NodeGroups;
    this.eventManager._receive_groups(groups);
  }

  async fullsync() {
    if (!this.context.worker._zustand) return;
    if (!this.context.worker.is_open) return;
    let resp: FullState;
    while (true) {
      try {
        resp = (await this.communicationManager._send_cmd({
          cmd: "full_state",
          unique: true,
        })) as FullState;
        break;
      } catch (e) {
        this.context.worker._zustand.logger.error("Error in fullsync", e);
      }
    }
    this.context.worker._zustand.logger.debug("Full state", resp);
    this.context.worker._zustand.lib.libstate.getState().set({
      lib: resp.backend.lib,
      external_worker: resp.worker_dependencies,
    });
    if (resp.view.renderoptions)
      this.context.worker._zustand.update_render_options(
        resp.view.renderoptions
      );
    const nodeview = resp.view.nodes;
    for (const node of resp.backend.nodes) {
      const _nodeview = nodeview[node.id];
      if (_nodeview !== undefined) {
        update_nodeview(node, _nodeview);
      }
      this.eventManager._receive_node_added(node);
    }
    for (const edge of resp.backend.edges) {
      this.eventManager._receive_edge_added(...edge);
    }
    const groups = resp.backend.groups;
    if (groups) {
      this.eventManager._receive_groups(groups);
    }
  }

  sync_local_node_updates() {
    clearTimeout(this._nodeupdatetimer);
    this._local_nodeupdates.forEach(async (node, id) => {
      const ans = await this.context.worker
        .getCommunicationManager()
        ._send_cmd({
          cmd: "update_node",
          kwargs: { nid: id, data: node },
          wait_for_response: true,
        });
      if (!this.context.worker._zustand) return;
      this.context.worker._zustand.on_node_action({
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

  sync_local_group_updates() {
    clearTimeout(this._groupupdatetimer);
    this._local_groupupdates.forEach(async (group, id) => {
      const ans = await this.communicationManager._send_cmd({
        cmd: "update_group",
        kwargs: { gid: id, data: group },
        wait_for_response: true,
      });
      if (!this.context.worker._zustand) return;
      this.context.worker._zustand.on_group_action({
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
}
