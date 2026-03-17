import type { ExternalWorkerDependencies, LibType } from "@/library";
import type { ViewState } from "./view";
import type { NodeGroups } from "@/groups";
import type { SerializedNodeType } from "@/nodes-core";

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
