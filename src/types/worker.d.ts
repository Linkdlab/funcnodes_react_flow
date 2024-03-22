interface RenderOptions {
  typemap?: { [key: string]: string };
}
interface ViewState {
  nodes: { [key: string]: NodeViewState };
  renderoptions?: RenderOptions;
}

interface FullNodeSpaceJSON {
  nodes: NodeType[];
  edges: [str, str, str, str][];
  prop: { [key: string]: any };
  lib: LibType;
}

interface FullState {
  backend: FullNodeSpaceJSON;
  view: ViewState;
  worker: { [key: string]: string[] };
}
