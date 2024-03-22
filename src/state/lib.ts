import { useStore, create, UseBoundStore, StoreApi } from "zustand";

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
export type { LibZustandInterface, LibState };
