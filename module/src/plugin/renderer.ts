// make an abstarct class for the common code

import {
  HandlePreviewRendererType,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  NodeRendererType,
  NodeContextExtenderType,
} from "../frontend/datarenderer/rendermappings";
import { InputRendererType, OutputRendererType } from "../states/nodeio.t";
("../states/nodeio.t");

interface RendererPlugin {
  input_renderers?: { [key: string]: InputRendererType };
  output_renderers?: { [key: string]: OutputRendererType };
  handle_preview_renderers?: { [key: string]: HandlePreviewRendererType };
  data_overlay_renderers?: { [key: string]: DataOverlayRendererType };
  data_preview_renderers?: { [key: string]: DataPreviewViewRendererType };
  data_view_renderers?: { [key: string]: DataViewRendererType };
  node_renderers?: { [key: string]: NodeRendererType };
  node_context_extenders?: { [key: string]: NodeContextExtenderType };
}

export default RendererPlugin;
