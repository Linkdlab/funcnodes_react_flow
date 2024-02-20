import { useStore, create, UseBoundStore, StoreApi } from "zustand";

type LibNode = {
  node_id: string;
  description?: string;
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

const LibZustand = (): LibZustandInterface => {
  return {
    libstate: create<LibState>((set, get) => ({
      state: {
        shelves: [],
      },
      set: (state: LibType) => set({ state: state }),
      get: () => get().state,
    })),
  };
};

export default LibZustand;
export type { LibZustandInterface, LibState, Shelf, LibType, LibNode };
