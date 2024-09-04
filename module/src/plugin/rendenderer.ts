// make an abstarct class for the common code

import {
  HandlePreviewRendererType,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
} from "../frontend/datarenderer/rendermappings";
import { InputRendererType } from "../states/nodeio.t";
("../states/nodeio.t");

interface RendererPlugin {
  input_renderers?: { [key: string]: InputRendererType };
  handle_preview_renderers?: { [key: string]: HandlePreviewRendererType };
  data_overlay_renderers?: { [key: string]: DataOverlayRendererType };
  data_preview_renderers?: { [key: string]: DataPreviewViewRendererType };
  data_view_renderers?: { [key: string]: DataViewRendererType };
}

export default RendererPlugin;
