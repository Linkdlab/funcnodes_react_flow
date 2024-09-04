import { create } from "zustand";
import { LibZustandInterface, LibState } from "./lib.t";

const LibZustand = (): LibZustandInterface => {
  return {
    libstate: create<LibState>((set, get) => ({
      lib: {
        shelves: [],
      },
      external_worker: [],
      set: (state) => set((prev) => ({ ...prev, ...state })),
      get_lib: () => get().lib,
      get_external_worker: () => get().external_worker,
    })),
  };
};

export default LibZustand;
