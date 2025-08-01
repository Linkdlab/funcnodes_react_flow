import { RenderOptions } from "@/data-rendering-types";

export interface NodeViewState {
  pos: [number, number];
  size: [number, number];
  collapsed: boolean;
}
export interface ViewState {
  nodes: { [key: string]: NodeViewState | undefined };
  renderoptions?: RenderOptions;
}
