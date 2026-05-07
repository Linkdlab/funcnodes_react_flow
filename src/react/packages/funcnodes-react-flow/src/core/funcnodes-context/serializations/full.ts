import type { ExternalWorkerDependencies, LibType } from "@/library";
import type { NodeViewState, ViewState } from "./view";
import type { NodeGroups } from "@/groups";
import type { SerializedNodeType } from "@/nodes-core";
import type { NodeSpacePath } from "../handler/state-manager";

export interface FullNodeSpaceJSON {
  nodes: SerializedNodeType[];
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

/**
 * Path-aware backend snapshot used to render the currently active nodespace.
 */
export interface EditableNodeSpaceSnapshot {
  path: NodeSpacePath;
  nodes: SerializedNodeType[];
  edges: [string, string, string, string][];
  groups?: NodeGroups;
  view?: {
    nodes?: Record<string, NodeViewState>;
  };
}
