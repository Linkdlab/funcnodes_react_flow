import { AbstractFuncNodesReactFlowHandleHandler } from "./rf-handlers.types";
import type { FuncNodesReactFlowHandlerContext } from "./rf-handlers.types";
import { deep_merge } from "@/object-helpers";
import { create } from "zustand";
import type { UseBoundStore, StoreApi } from "zustand";
import { update_zustand_store } from "@/zustand-helpers";
import type { ProgressState } from "../states/progress";
import type { ToastDispatcher } from "@/shared-components";

export interface StateManagerManagerAPI {
  set_progress: (progress: ProgressState) => void;
  auto_progress: () => void;
  set_nodespace_path: (path: NodeSpacePath) => void;
  enter_group_nodespace: (groupNodeId: string, label: string) => void;
  leave_group_nodespace: () => void;
  go_to_nodespace_path_index: (index: number) => void;
  reset_nodespace_path: () => void;
  sync_active_nodespace: () => Promise<void>;
  toast?: ToastDispatcher;
}

export interface FuncnodesReactFlowViewSettings {
  expand_node_props?: boolean;
  expand_lib?: boolean;
}
export interface FuncnodesReactFlowLocalSettings {
  view_settings: FuncnodesReactFlowViewSettings;
}

export interface FuncnodesReactFlowLocalState {
  selected_nodes: string[];
  selected_edges: string[];
  selected_groups: string[];
  funcnodescontainerRef: HTMLDivElement | null;
}

/**
 * One segment in the currently edited executable group nodespace path.
 */
export interface NodeSpacePathEntry {
  groupNodeId: string;
  label: string;
}

/**
 * Path from the root nodespace to the currently edited nested group.
 */
export type NodeSpacePath = NodeSpacePathEntry[];

/**
 * Minimal React Flow viewport snapshot persisted per nodespace path.
 */
export interface NodeSpaceViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Local UI state for the active nodespace navigation model.
 */
export interface ActiveNodeSpaceState {
  path: NodeSpacePath;
  viewportByPath: Record<string, NodeSpaceViewport>;
  loading: boolean;
  error?: string;
}

/**
 * Builds a stable map key for per-path UI state such as saved viewports.
 */
export const nodespacePathKey = (path: NodeSpacePath): string =>
  path.map((entry) => entry.groupNodeId).join("/");

export class StateManagerHandler
  extends AbstractFuncNodesReactFlowHandleHandler
  implements StateManagerManagerAPI
{
  progress_state: UseBoundStore<StoreApi<ProgressState>>;
  local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
  local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
  active_nodespace: UseBoundStore<StoreApi<ActiveNodeSpaceState>>;
  toaster?: ToastDispatcher;
  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    this.progress_state = create<ProgressState>((_set, _get) => ({
      message: "please select worker",
      status: "info",
      progress: 0,
      blocking: false,
    }));
    this.local_settings = create<FuncnodesReactFlowLocalSettings>(
      (_set, _get) => ({
        view_settings: {
          expand_node_props: false,
          expand_lib: false,
        },
      })
    );
    this.local_state = create<FuncnodesReactFlowLocalState>((_set, _get) => ({
      selected_nodes: [],
      selected_edges: [],
      selected_groups: [],
      funcnodescontainerRef: null,
    }));
    this.active_nodespace = create<ActiveNodeSpaceState>((_set, _get) => ({
      path: [],
      viewportByPath: {},
      loading: false,
      error: undefined,
    }));
  }
  set_progress(progress: ProgressState) {
    if (progress.message === "") {
      return this.auto_progress();
    }

    const prev_state = this.progress_state.getState();
    const { new_obj, change } = deep_merge<ProgressState>(prev_state, progress);
    if (change) {
      this.progress_state.setState(new_obj);
    }
  }
  auto_progress(): void {
    const workermanager = this.workerManager.workermanager;
    const worker = this.workerManager.worker;
    if (workermanager !== undefined && !workermanager.open) {
      return this.set_progress({
        progress: 0,
        message: "connecting to worker manager",
        status: "error",
        blocking: false,
      });
    }
    if (worker === undefined) {
      return this.set_progress({
        progress: 0,
        message: "please select worker",
        status: "error",
        blocking: false,
      });
    }
    if (!worker.is_open) {
      return this.set_progress({
        progress: 0,
        message: "connecting to worker",
        status: "info",
        blocking: true,
      });
    }
    this.set_progress({
      progress: 1,
      message: "running",
      status: "info",
      blocking: false,
    });
  }

  update_view_settings(settings: FuncnodesReactFlowViewSettings) {
    update_zustand_store(this.local_settings, { view_settings: settings });
  }

  /**
   * Saves the current React Flow viewport for the currently active path.
   */
  save_active_nodespace_viewport(): void {
    const rfInstance = this.reactFlowManager.rf_instance as
      | { getViewport?: () => NodeSpaceViewport }
      | undefined;
    const viewport = rfInstance?.getViewport?.();
    if (!viewport) return;

    const state = this.active_nodespace.getState();
    this.active_nodespace.setState({
      viewportByPath: {
        ...state.viewportByPath,
        [nodespacePathKey(state.path)]: viewport,
      },
    });
  }

  /**
   * Restores a saved React Flow viewport for the currently active path.
   */
  restore_active_nodespace_viewport(): void {
    const rfInstance = this.reactFlowManager.rf_instance as
      | { setViewport?: (viewport: NodeSpaceViewport) => void }
      | undefined;
    const state = this.active_nodespace.getState();
    const viewport = state.viewportByPath[nodespacePathKey(state.path)];
    if (!viewport) return;

    rfInstance?.setViewport?.(viewport);
  }

  /**
   * Replaces the active nodespace path and preserves viewport state around the
   * transition.
   */
  set_nodespace_path(path: NodeSpacePath): void {
    this.save_active_nodespace_viewport();
    this.active_nodespace.setState({
      path: path.map((entry) => ({ ...entry })),
      error: undefined,
    });
    this.restore_active_nodespace_viewport();
  }

  /**
   * Enters a child executable group nodespace from the current path.
   */
  enter_group_nodespace(groupNodeId: string, label: string): void {
    const currentPath = this.active_nodespace.getState().path;
    const lastEntry = currentPath[currentPath.length - 1];
    if (lastEntry?.groupNodeId === groupNodeId) return;

    this.set_nodespace_path([...currentPath, { groupNodeId, label }]);
  }

  /**
   * Leaves the currently active group nodespace and returns to its parent.
   */
  leave_group_nodespace(): void {
    const currentPath = this.active_nodespace.getState().path;
    this.set_nodespace_path(currentPath.slice(0, -1));
  }

  /**
   * Navigates to a path ancestor by index, or to root when the index is below
   * zero.
   */
  go_to_nodespace_path_index(index: number): void {
    const currentPath = this.active_nodespace.getState().path;
    if (index < 0) {
      this.set_nodespace_path([]);
      return;
    }
    this.set_nodespace_path(currentPath.slice(0, index + 1));
  }

  /**
   * Clears the active nodespace path, typically after worker or document
   * replacement.
   */
  reset_nodespace_path(): void {
    this.active_nodespace.setState({
      path: [],
      loading: false,
      error: undefined,
    });
    this.restore_active_nodespace_viewport();
  }

  /**
   * Placeholder sync hook for later milestones that will request path-aware
   * worker snapshots.
   */
  async sync_active_nodespace(): Promise<void> {
    return Promise.resolve();
  }
}
