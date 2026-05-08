import { AbstractWorkerHandler } from "./worker-handlers.types";
import type { NodeSpaceEvent, WorkerEvent } from "@/messages";
import type { NodeGroups } from "@/groups";
import type { NodeActionError } from "@/funcnodes-context";
import type { NodeSpacePath } from "@/funcnodes-context";
import { nodespacePathKey } from "@/funcnodes-context";
import type { SerializedNodeType } from "@/nodes-core";

type RoutedNodeSpaceEvent = {
  event: string;
  data: { [key: string]: any | undefined };
};

const INNER_PARENT_EVENTS = new Set([
  "node_trigger_error",
  "triggerstart",
  "triggerdone",
  "triggerfast",
  "progress",
]);

const IGNORED_NODE_EVENTS = new Set([
  "after_set_nodespace",
  "before_request_trigger",
  "after_request_trigger",
]);

/** Returns whether a value is shaped like a frontend nodespace path. */
const isNodeSpacePath = (value: unknown): value is NodeSpacePath => {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry !== null &&
        typeof entry === "object" &&
        typeof (entry as any).groupNodeId === "string"
    )
  );
};

/** Copies path entries so event routing cannot mutate message payloads. */
const normalizeNodeSpacePath = (value: unknown): NodeSpacePath | undefined => {
  if (!isNodeSpacePath(value)) return undefined;
  return value.map((entry) => ({
    groupNodeId: entry.groupNodeId,
    label: entry.label,
  }));
};

/** Compares two frontend nodespace paths by stable group ids. */
const nodespacePathsEqual = (
  first: NodeSpacePath,
  second: NodeSpacePath
): boolean => nodespacePathKey(first) === nodespacePathKey(second);

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

  /** Returns the path currently rendered in React Flow. */
  private getActiveNodeSpacePath(): NodeSpacePath {
    return this.context.worker._zustand?.active_nodespace.getState().path ?? [];
  }

  /** Marks a path stale so returning to that path fetches a fresh snapshot. */
  private markNodeSpacePathStale(path: NodeSpacePath): void {
    const zustand = this.context.worker._zustand;
    if (!zustand) return;
    const stateManager = zustand.getStateManager?.();
    if (stateManager?.mark_nodespace_path_stale) {
      stateManager.mark_nodespace_path_stale(path);
      return;
    }

    const activeState = zustand.active_nodespace.getState();
    zustand.active_nodespace.setState({
      stalePathKeys: {
        ...(activeState.stalePathKeys || {}),
        [nodespacePathKey(path)]: true,
      },
    });
  }

  /** Requests a conservative active-path resync for pathless live events. */
  private syncActiveNodeSpacePath(path: NodeSpacePath): void {
    void this.context.worker
      .getSyncManager()
      .sync_active_nodespace(path);
  }

  /**
   * Routes one worker nodespace event to the currently displayed path.
   *
   * Events for inactive paths are not applied to the live React Flow state.
   * Instead their paths are marked stale so an explicit navigation/sync fetches
   * a fresh worker snapshot. Pathless events remain compatible with the root
   * view, but trigger a conservative resync when the user is inside a group.
   */
  private routeNodeSpaceEvent(
    event: string,
    data: { [key: string]: any | undefined }
  ): RoutedNodeSpaceEvent | undefined {
    const activePath = this.getActiveNodeSpacePath();
    const eventPath = normalizeNodeSpacePath(data.path);

    if (event.startsWith("inner_")) {
      const parentPath =
        normalizeNodeSpacePath(data.parent_path) ?? eventPath?.slice(0, -1);
      const innerEvent =
        typeof data.inner_event === "string" ? data.inner_event : undefined;

      if (innerEvent && IGNORED_NODE_EVENTS.has(innerEvent)) return undefined;

      if (eventPath && nodespacePathsEqual(activePath, eventPath)) {
        if (!innerEvent || typeof data.inner_node !== "string") {
          this.markNodeSpacePathStale(eventPath);
          return undefined;
        }
        return {
          event: innerEvent,
          data: {
            ...data,
            node: data.inner_node,
          },
        };
      }

      if (
        parentPath &&
        nodespacePathsEqual(activePath, parentPath) &&
        innerEvent &&
        INNER_PARENT_EVENTS.has(innerEvent)
      ) {
        return { event: innerEvent, data };
      }

      if (eventPath) this.markNodeSpacePathStale(eventPath);
      return undefined;
    }

    if (eventPath && !nodespacePathsEqual(activePath, eventPath)) {
      this.markNodeSpacePathStale(eventPath);
      return undefined;
    }

    if (!eventPath && activePath.length > 0) {
      this.markNodeSpacePathStale(activePath);
      this.syncActiveNodeSpacePath(activePath);
      return undefined;
    }

    return { event, data };
  }

  async receive_nodespace_event(ns_event: NodeSpaceEvent) {
    const intercepted = await this.intercept_ns_event(ns_event);
    const routedEvent = this.routeNodeSpaceEvent(
      intercepted.event,
      intercepted.data
    );
    if (!routedEvent) return;
    const { event, data } = routedEvent;

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
        if (IGNORED_NODE_EVENTS.has(event)) return;
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
