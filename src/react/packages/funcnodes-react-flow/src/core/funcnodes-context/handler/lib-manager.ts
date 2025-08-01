import { LibState, LibZustandInterface } from "@/library";
import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import { create } from "zustand";

export const LibZustand = (): LibZustandInterface => {
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

export interface LibManagerManagerAPI {}

export class LibManager
  extends AbstractFuncNodesReactFlowHandleHandler
  implements LibManagerManagerAPI
{
  public lib: LibZustandInterface;
  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    this.lib = LibZustand();
  }
}
