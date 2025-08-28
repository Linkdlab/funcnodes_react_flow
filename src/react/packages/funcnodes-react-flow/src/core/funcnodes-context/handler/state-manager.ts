import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import { deep_merge } from "@/object-helpers";
import { UseBoundStore, StoreApi, create } from "zustand";
import { update_zustand_store } from "@/zustand-helpers";
import { ProgressState } from "../states/progress";
import { ToastDispatcher } from "@/shared-components";

export interface StateManagerManagerAPI {
  set_progress: (progress: ProgressState) => void;
  auto_progress: () => void;
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

export class StateManagerHandler
  extends AbstractFuncNodesReactFlowHandleHandler
  implements StateManagerManagerAPI
{
  progress_state: UseBoundStore<StoreApi<ProgressState>>;
  local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
  local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
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
}
