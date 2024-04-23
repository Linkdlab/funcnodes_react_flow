import { useStore, create, UseBoundStore, StoreApi } from "zustand";

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

interface LibState {
  state: LibType;
  set: (state: LibType) => void;
  get: () => LibType;
}

interface LibZustandInterface {
  libstate: UseBoundStore<StoreApi<LibState>>;
}

export type { LibZustandInterface, LibState, LibType, Shelf, LibNode };
