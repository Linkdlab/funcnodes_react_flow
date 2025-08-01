import { UseBoundStore, StoreApi } from "zustand";

export interface ExternalWorkerInstance {
  uuid: string;
  nodeclassid: string;
  running: boolean;
  name: string;
}
export interface ExternalWorkerClassDep {
  module: string;
  class_name: string;
  name: string;
  instances: ExternalWorkerInstance[];
}
export interface ExternalWorkerDependencies {
  module: string;
  worker_classes: ExternalWorkerClassDep[];
}

export interface LibNode {
  node_id: string;
  description?: string;
  node_name?: string;
}

export interface Shelf {
  name: string;
  description?: string;
  nodes: LibNode[];
  subshelves: Shelf[];
}

export interface LibType {
  shelves: Shelf[];
}

export interface LibState {
  lib: LibType;
  external_worker?: ExternalWorkerDependencies[];
  set: (state: {
    lib?: LibType;
    external_worker?: ExternalWorkerDependencies[];
  }) => void;
  get_lib: () => LibType;
  get_external_worker: () => ExternalWorkerDependencies[] | undefined;
}

export interface LibZustandInterface {
  libstate: UseBoundStore<StoreApi<LibState>>;
}
