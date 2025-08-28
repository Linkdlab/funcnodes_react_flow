import {
  DefaultDataOverlayRenderer,
  DefaultDataPreviewViewRenderer,
  DefaultDataViewRenderer,
  DefaultHandlePreviewRenderer,
  DefaultInLineRenderer,
  DefaultInputRenderer,
  DefaultOutputRenderer,
} from "../../components";
import {
  RenderMappingState,
  RenderMappingAction,
  NodeRendererType,
  NodeHooksType,
} from "./render-mappings.types";

// Initial empty mappings for plugin extensions
const _NodeRenderer: { [key: string]: NodeRendererType | undefined } = {};
const _NodeHooks: { [key: string]: NodeHooksType[] | undefined } = {};

// Initial state for the reducer
export const initialRenderMappings: RenderMappingState = {
  Inputrenderer: DefaultInputRenderer,
  Outputrenderer: DefaultOutputRenderer,
  HandlePreviewRenderer: DefaultHandlePreviewRenderer,
  DataOverlayRenderer: DefaultDataOverlayRenderer,
  DataPreviewViewRenderer: DefaultDataPreviewViewRenderer,
  DataViewRenderer: DefaultDataViewRenderer,
  InLineRenderer: DefaultInLineRenderer,

  NodeRenderer: _NodeRenderer,
  NodeHooks: _NodeHooks,
};

// The reducer function to manage render mapping state
export const renderMappingReducer = (
  state: RenderMappingState,
  action: RenderMappingAction
): RenderMappingState => {
  const options = action.options || {};
  const overwrite = options.overwrite === undefined ? true : options.overwrite;

  switch (action.type) {
    case "EXTEND_INPUT_RENDER":
      if (!overwrite && state.Inputrenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        Inputrenderer: {
          ...state.Inputrenderer,
          [action.payload.type]: action.payload.component,
        },
      };

    case "EXTEND_FROM_PLUGIN": {
      // Scoped to prevent redeclaration
      let something_new = false;
      const checkpairs: [Partial<Record<string, any>>, Record<string, any>][] =
        [
          [action.payload.plugin.input_renderers || {}, state.Inputrenderer],
          [action.payload.plugin.output_renderers || {}, state.Outputrenderer],
          [
            action.payload.plugin.handle_preview_renderers || {},
            state.HandlePreviewRenderer,
          ],
          [
            action.payload.plugin.data_overlay_renderers || {},
            state.DataOverlayRenderer,
          ],
          [
            action.payload.plugin.data_preview_renderers || {},
            state.DataPreviewViewRenderer,
          ],
          [
            action.payload.plugin.data_view_renderers || {},
            state.DataViewRenderer,
          ],
          [action.payload.plugin.node_renderers || {}, state.NodeRenderer],
          [action.payload.plugin.node_hooks || {}, state.NodeHooks],
        ];

      for (const [new_renderer, old_renderer] of checkpairs) {
        if (Object.keys(new_renderer).length > 0) {
          if (overwrite) {
            something_new = true;
          } else {
            for (const key in new_renderer) {
              if (!old_renderer[key]) {
                something_new = true;
                break;
              }
            }
          }
        }
        if (something_new) break;
      }

      if (!something_new) {
        return state;
      }

      const newState = { ...state };
      checkpairs.forEach(([new_renderer, old_renderer]) => {
        Object.assign(old_renderer, new_renderer);
      });

      return newState;
    }

    default:
      // Simplified all other cases as they follow the same pattern
      const keyMap = {
        EXTEND_OUTPUT_RENDER: "Outputrenderer",
        EXTEND_HANDLE_PREVIEW_RENDER: "HandlePreviewRenderer",
        EXTEND_DATA_OVERLAY_RENDER: "DataOverlayRenderer",
        EXTEND_DATA_PREVIEW_RENDER: "DataPreviewViewRenderer",
        EXTEND_DATA_VIEW_RENDER: "DataViewRenderer",
        EXTEND_NODE_CONTEXT_EXTENDER: "NodeContextExtenders",
        EXTEND_NODE_RENDERER: "NodeRenderer",
        EXTEND_NODE_HOOKS: "NodeHooks",
      };

      const storeKey = keyMap[action.type as keyof typeof keyMap];
      if (storeKey) {
        const store = state[storeKey as keyof RenderMappingState] as Record<
          string,
          any
        >;
        if (!overwrite && store[action.payload.type]) {
          return state;
        }
        return {
          ...state,
          [storeKey]: {
            ...store,
            [action.payload.type]: action.payload.component,
          },
        };
      }
      return state;
  }
};
