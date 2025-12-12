import { AbstractWorkerHandler } from "./worker-handlers.types";
import { NodeSpaceEvent, WorkerEvent } from "@/messages";
import { NodeGroups } from "@/groups";
import { NodeActionError } from "@/funcnodes-context";
import { SerializedNodeType } from "@/nodes-core";

export class WorkerEventManager extends AbstractWorkerHandler {
  private _ns_event_intercepts: Map<
    string,
    ((event: NodeSpaceEvent) => Promise<NodeSpaceEvent>)[]
  > = new Map();

  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }
  async _receive_edge_added(
    src_nid: string,
    src_ioid: string,
    trg_nid: string,
    trg_ioid: string
  ) {
    if (!this.context.worker._zustand) return;
    this.context.worker._zustand.on_edge_action({
      type: "add",
      from_remote: true,
      ...{ src_nid, src_ioid, trg_nid, trg_ioid },
    });
  }

  async _receive_groups(groups: NodeGroups) {
    if (!this.context.worker._zustand) return;
    this.context.worker._zustand.on_group_action({
      type: "set",
      groups: groups,
    });
  }

  async _receive_node_added(data: SerializedNodeType) {
    if (!this.context.worker._zustand) return;
    return this.context.worker._zustand.on_node_action({
      type: "add",
      node: data,
      id: data.id,
      from_remote: true,
    });
  }

  async receive_workerevent({ event, data }: WorkerEvent) {
    switch (event) {
      case "worker_error":
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.logger.error(data.error);
      case "update_worker_dependencies":
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.lib.libstate.getState().set({
          external_worker: data.worker_dependencies,
        });
      case "lib_update":
        await this.context.worker.getSyncManager().sync_lib();
        return;
      case "fullsync":
        await this.context.worker.getSyncManager().stepwise_fullsync();
        return;
      case "external_worker_update":
        await this.context.worker.getSyncManager().sync_lib();
        await this.context.worker.getSyncManager().sync_external_worker();
        return;

      case "repos_update":
        // Forward repo updates to hooks so UIs can refresh module lists if open.
        await this.hookManager.call_hooks(
          "repos_update",
          (data as any).repos ?? data
        );
        return;

      case "starting":
        this.hookManager.call_hooks("starting");
        return;
      case "stopping":
        this.hookManager.call_hooks("stopping");
        return;
      default:
        console.warn("Unhandled worker event", event, data);
        break;
    }
  }

  async intercept_ns_event(event: NodeSpaceEvent) {
    let newevent = event;
    for (const h of this._ns_event_intercepts.get(event.event) || []) {
      newevent = await h(newevent);
    }
    return newevent;
  }

  async receive_nodespace_event(ns_event: NodeSpaceEvent) {
    const { event, data } = await this.intercept_ns_event(ns_event);

    switch (event) {
      case "after_set_value":
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_node_action({
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
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_node_action({
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
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: true,
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerdone":
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: false,
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerfast":
        if (!this.context.worker._zustand) return;
        this.context.worker._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: true,
          },
          id: data.node,
          from_remote: true,
        });
        setTimeout(() => {
          if (!this.context.worker._zustand) return;
          this.context.worker._zustand.on_node_action({
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
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_node_action({
          type: "error",
          errortype: "trigger",
          error: data.error,
          id: data.node,
          tb: data.tb,
          from_remote: true,
        } as NodeActionError);

      case "node_removed":
        if (!this.context.worker._zustand) return;
        this.context.worker._zustand.on_node_action({
          type: "delete",
          id: data.node,
          from_remote: true,
        });
        this.hookManager.call_hooks("node_removed", {
          node: data.node,
        });
        return;

      case "node_added":
        this._receive_node_added(data.node as SerializedNodeType);
        return;

      case "after_disconnect":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_edge_action({
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
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.on_edge_action({
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
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.lib.libstate.getState().set({
          lib: data.result,
        });
      case "after_remove_shelf":
        if (!data.result) return;
        if (!this.context.worker._zustand) return;
        return this.context.worker._zustand.lib.libstate.getState().set({
          lib: data.result,
        });

      case "progress":
        if (!this.context.worker._zustand) return;
        if (data.node) {
          return this.context.worker._zustand.on_node_action({
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
}
