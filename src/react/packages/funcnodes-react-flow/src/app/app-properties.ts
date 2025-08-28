import {
  FuncnodesReactFlowProps,
  FuncnodesReactHeaderProps,
  ReactFlowLayerProps,
  ReactFlowLibraryProps,
} from "./app.types";

const DEFAULT_LIB_PROPS: ReactFlowLibraryProps = {
  show: true,
};

const DEFAULT_HEADER_PROPS: FuncnodesReactHeaderProps = {
  show: true,
  showmenu: true,
};

const DEFAULT_FLOW_PROPS: ReactFlowLayerProps = {
  minimap: true,
  static: false,
  minZoom: 0.1,
  maxZoom: 5,
  allowFullScreen: true,
  allowExpand: true,
  showNodeSettings: true,
};

export const DEFAULT_FN_PROPS: FuncnodesReactFlowProps = {
  id: "", // required
  debug: false,
  useWorkerManager: true,
  show_library: true,
  header: DEFAULT_HEADER_PROPS,
  flow: DEFAULT_FLOW_PROPS,
  library: DEFAULT_LIB_PROPS,
};

export const AVAILABLE_COLOR_THEMES: string[] = [
  "classic",
  "metal",
  "light",
  "solarized",
  "midnight",
  "forest",
  "scientific",
  "neon",
  "ocean",
  "sunset",
];
