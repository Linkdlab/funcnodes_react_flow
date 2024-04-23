import { create } from "zustand";
import { LibType, LibZustandInterface, LibState } from "./lib.t";

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
