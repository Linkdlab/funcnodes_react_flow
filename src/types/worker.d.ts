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

interface ProgressState {
  message: string;
  status: string;
  progress: number;
  blocking: boolean;
}

interface ProgressStateMessage extends ProgressState {
  type: "progress";
}

interface ResultMessage {
  type: "result";
  id?: string;
  result: any;
}

interface ErrorMessage {
  type: "error";
  error: string;
  tb: string[];
  id?: string;
}

interface NodeSpaceEvent {
  type: "nsevent";
  event: string;
  data: { [key: string]: any };
}
type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent;
