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
// class RendererPlugin {
//   _input_renderers: { [key: string]: InputRendererType };
//   _handle_preview_renderers: { [key: string]: HandlePreviewRendererType };
//   _data_overlay_renderers: { [key: string]: DataOverlayRendererType };
//   _data_preview_renderers: { [key: string]: DataPreviewViewRendererType };
//   _data_view_renderers: { [key: string]: DataViewRendererType };

//   constructor({
//     input_renderers,
//     handle_preview_renderers,
//     data_overlay_renderers,
//     data_preview_renderers,
//     data_view_renderers,
//   }: {
//     input_renderers?: { [key: string]: InputRendererType };
//     handle_preview_renderers?: { [key: string]: HandlePreviewRendererType };
//     data_overlay_renderers?: { [key: string]: DataOverlayRendererType };
//     data_preview_renderers?: { [key: string]: DataPreviewViewRendererType };
//     data_view_renderers?: { [key: string]: DataViewRendererType };
//   }) {
//     this._input_renderers = input_renderers || {};
//     this._handle_preview_renderers = handle_preview_renderers || {};
//     this._data_overlay_renderers = data_overlay_renderers || {};
//     this._data_preview_renderers = data_preview_renderers || {};
//     this._data_view_renderers = data_view_renderers || {};
//   }

//   get_input_renderers(): { [key: string]: InputRendererType } {
//     return this._input_renderers;
//   }
//   get_handle_preview_renderers(): { [key: string]: HandlePreviewRendererType } {
//     return this._handle_preview_renderers;
//   }
//   get_data_overlay_renderers(): { [key: string]: DataOverlayRendererType } {
//     return this._data_overlay_renderers;
//   }
//   get_data_preview_renderers(): { [key: string]: DataPreviewViewRendererType } {
//     return this._data_preview_renderers;
//   }
//   get_data_view_renderers(): { [key: string]: DataViewRendererType } {
//     return this._data_view_renderers;
//   }
// }

export default RendererPlugin;
