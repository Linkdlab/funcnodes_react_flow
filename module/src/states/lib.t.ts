import { UseBoundStore, StoreApi } from "zustand";

type LibNode = {
  node_id: string;
  description?: string;
  node_name?: string;
};

type Shelf = {
  name: string;
  description?: string;
  nodes: LibNode[];
  subshelves: Shelf[];
};

type LibType = {
  shelves: Shelf[];
};

interface ExternalWorkerInstance {
  uuid: string;
  nodeclassid: string;
  running: boolean;
  name: string;
}
interface ExternalWorkerClassDep {
  module: string;
  class_name: string;
  name: string;
  instances: ExternalWorkerInstance[];
}
interface ExternalWorkerDependecies {
  module: string;
  worker_classes: ExternalWorkerClassDep[];
}

interface LibState {
  lib: LibType;
  external_worker?: ExternalWorkerDependecies[];
  set: (state: {
    lib?: LibType;
    external_worker?: ExternalWorkerDependecies[];
  }) => void;
  get_lib: () => LibType;
  get_external_worker: () => ExternalWorkerDependecies[] | undefined;
}

interface LibZustandInterface {
  libstate: UseBoundStore<StoreApi<LibState>>;
}

export type {
  LibZustandInterface,
  LibState,
  LibType,
  Shelf,
  LibNode,
  ExternalWorkerClassDep,
  ExternalWorkerDependecies,
  ExternalWorkerInstance,
};
