import React, {
  ReactElement,
  createContext,
  useEffect,
  useReducer,
} from "react";
import { IOType, InputRendererType } from "../../states/nodeio.t";
import {
  FloatInput,
  IntegerInput,
  BooleanInput,
  StringInput,
  ColorInput,
  SelectionInput,
} from "../node/io/default_input_renderer";

import {
  Base64ImageOutput,
  DictOutput,
  SingleValueOutput,
  TableOutput,
} from "./default_preview_renderer";
import RendererPlugin from "../../plugin/rendenderer";

import FuncNodesReactPlugin from "../../plugin";

const _Inputrenderer: {
  [key: string]: InputRendererType;
} = {
  float: FloatInput,
  int: IntegerInput,
  bool: BooleanInput,
  string: StringInput,
  str: StringInput,
  color: ColorInput,
  select: SelectionInput,
  enum: SelectionInput,
};

type HandlePreviewRendererType = ({ io }: { io: IOType }) => JSX.Element;
const _HandlePreviewGenerators: {
  [key: string]: HandlePreviewRendererType;
} = {};

type DataOverlayRendererType = ({ io }: { io: IOType }) => JSX.Element;
const _DataOverlayViewGenerators: {
  [key: string]: DataOverlayRendererType;
} = {};

type DataPreviewViewRendererType = ({ io }: { io: IOType }) => JSX.Element;

const _DataPreviewViewRenderer: {
  [key: string]: DataPreviewViewRendererType;
} = {
  string: SingleValueOutput,
  table: TableOutput,
  image: Base64ImageOutput,
  dict: DictOutput,
};

type DataViewRendererType = ({ io }: { io: IOType }) => JSX.Element;

const _DataViewRenderer: {
  [key: string]: DataViewRendererType;
} = {};

interface RenderMappingState {
  Inputrenderer: {
    [key: string]: InputRendererType;
  };
  HandlePreviewRenderer: {
    [key: string]: HandlePreviewRendererType;
  };
  DataOverlayRenderer: {
    [key: string]: DataOverlayRendererType;
  };
  DataPreviewViewRenderer: {
    [key: string]: DataPreviewViewRendererType;
  };
  DataViewRenderer: {
    [key: string]: DataViewRendererType;
  };
}

interface DispatchOptions {
  overwrite?: boolean;
}

interface extend_input_renderer_action {
  type: "EXTEND_INPUT_RENDER";
  payload: {
    type: string;
    component: InputRendererType;
  };
  options?: DispatchOptions;
}

interface extend_handle_preview_renderer_action {
  type: "EXTEND_HANDLE_PREVIEW_RENDER";
  payload: {
    type: string;
    component: HandlePreviewRendererType;
  };
  options?: DispatchOptions;
}

interface extend_data_overlay_renderer_action {
  type: "EXTEND_DATA_OVERLAY_RENDER";
  payload: {
    type: string;
    component: DataOverlayRendererType;
  };
  options?: DispatchOptions;
}

interface extend_data_preview_renderer_action {
  type: "EXTEND_DATA_PREVIEW_RENDER";
  payload: {
    type: string;
    component: DataPreviewViewRendererType;
  };
  options?: DispatchOptions;
}

interface extend_data_view_renderer_action {
  type: "EXTEND_DATA_VIEW_RENDER";
  payload: {
    type: string;
    component: DataViewRendererType;
  };
  options?: DispatchOptions;
}

interface extend_from_plugin_action {
  type: "EXTEND_FROM_PLUGIN";
  payload: {
    plugin: RendererPlugin;
  };
  options?: DispatchOptions;
}

type renderMappingAction =
  | extend_input_renderer_action
  | extend_handle_preview_renderer_action
  | extend_data_overlay_renderer_action
  | extend_data_preview_renderer_action
  | extend_data_view_renderer_action
  | extend_from_plugin_action;

const _initialRenderMappings: RenderMappingState = {
  Inputrenderer: _Inputrenderer,
  HandlePreviewRenderer: _HandlePreviewGenerators,
  DataOverlayRenderer: _DataOverlayViewGenerators,
  DataPreviewViewRenderer: _DataPreviewViewRenderer,
  DataViewRenderer: _DataViewRenderer,
};

const renderMappingReducer = (
  state: RenderMappingState,
  action: renderMappingAction
) => {
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
    case "EXTEND_HANDLE_PREVIEW_RENDER":
      if (!overwrite && state.HandlePreviewRenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        HandlePreviewRenderer: {
          ...state.HandlePreviewRenderer,
          [action.payload.type]: action.payload.component,
        },
      };

    case "EXTEND_DATA_OVERLAY_RENDER":
      if (!overwrite && state.DataOverlayRenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        DataOverlayRenderer: {
          ...state.DataOverlayRenderer,
          [action.payload.type]: action.payload.component,
        },
      };
    case "EXTEND_DATA_PREVIEW_RENDER":
      if (!overwrite && state.DataPreviewViewRenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        DataPreviewViewRenderer: {
          ...state.DataPreviewViewRenderer,
          [action.payload.type]: action.payload.component,
        },
      };

    case "EXTEND_DATA_VIEW_RENDER":
      if (!overwrite && state.DataViewRenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        DataViewRenderer: {
          ...state.DataViewRenderer,
          [action.payload.type]: action.payload.component,
        },
      };
    case "EXTEND_FROM_PLUGIN":
      let something_new = false;

      const checkpairs = [
        [action.payload.plugin.input_renderers || {}, state.Inputrenderer],
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
      ];

      for (const [new_Inputrenderer, old_Inputrenderer] of checkpairs) {
        if (Object.keys(new_Inputrenderer).length > 0) {
          if (overwrite) {
            something_new = true;
          } else {
            for (const key in new_Inputrenderer) {
              if (!old_Inputrenderer[key]) {
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

      for (const [new_Inputrenderer, old_Inputrenderer] of checkpairs) {
        for (const key in new_Inputrenderer) {
          if (overwrite || !old_Inputrenderer[key]) {
            old_Inputrenderer[key] = new_Inputrenderer[key];
          }
        }
      }

      const newstate = { ...state };
      return newstate;

    default:
      return state;
  }
};

const RenderMappingProvider = ({
  children,
  plugins,
}: {
  children: ReactElement;
  plugins: {
    [key: string]: FuncNodesReactPlugin;
  };
}) => {
  const [state, dispatch] = useReducer(
    renderMappingReducer,
    _initialRenderMappings
  );

  const extendInputRenderMapping = (
    type: string,
    component: InputRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_INPUT_RENDER",
      payload: { type, component },
      options,
    });
  };

  const extendHandlePreviewRenderMapping = (
    type: string,
    component: HandlePreviewRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_HANDLE_PREVIEW_RENDER",
      payload: { type, component },
      options,
    });
  };

  const extendDataOverlayRenderMapping = (
    type: string,
    component: DataOverlayRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_DATA_OVERLAY_RENDER",
      payload: { type, component },
      options,
    });
  };

  const extendDataPreviewRenderMapping = (
    type: string,
    component: DataPreviewViewRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_DATA_PREVIEW_RENDER",
      payload: { type, component },
      options,
    });
  };

  const extendDataViewRenderMapping = (
    type: string,
    component: DataViewRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_DATA_VIEW_RENDER",
      payload: { type, component },
      options,
    });
  };

  const extendFromPlugin = (
    plugin: RendererPlugin,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_FROM_PLUGIN",
      payload: { plugin },
      options,
    });
  };
  useEffect(() => {
    for (const plugin in plugins) {
      const renderplug = plugins[plugin].RendererPlugin;
      if (renderplug) extendFromPlugin(renderplug);
    }
  }, [plugins]);

  return (
    <RenderMappingContext.Provider
      value={{
        Inputrenderer: state.Inputrenderer,
        HandlePreviewRenderer: state.HandlePreviewRenderer,
        DataOverlayRenderer: state.DataOverlayRenderer,
        DataPreviewViewRenderer: state.DataPreviewViewRenderer,
        DataViewRenderer: state.DataViewRenderer,
        extendInputRenderMapping,
        extendHandlePreviewRenderMapping,
        extendDataOverlayRenderMapping,
        extendDataPreviewRenderMapping,
        extendDataViewRenderMapping,
        extendFromPlugin,
      }}
    >
      {children}
    </RenderMappingContext.Provider>
  );
};

const RenderMappingContext = createContext({
  Inputrenderer: _initialRenderMappings.Inputrenderer,
  HandlePreviewRenderer: _initialRenderMappings.HandlePreviewRenderer,
  DataOverlayRenderer: _initialRenderMappings.DataOverlayRenderer,
  DataPreviewViewRenderer: _initialRenderMappings.DataPreviewViewRenderer,
  DataViewRenderer: _initialRenderMappings.DataViewRenderer,
  extendInputRenderMapping: (
    _type: string,
    _component: InputRendererType,
    _options: DispatchOptions
  ) => {},
  extendHandlePreviewRenderMapping: (
    _type: string,
    _component: HandlePreviewRendererType,
    _options: DispatchOptions
  ) => {},
  extendDataOverlayRenderMapping: (
    _type: string,
    _component: DataOverlayRendererType,
    _options: DispatchOptions
  ) => {},
  extendDataPreviewRenderMapping: (
    _type: string,
    _component: DataPreviewViewRendererType,
    _options: DispatchOptions
  ) => {},
  extendDataViewRenderMapping: (
    _type: string,
    _component: DataViewRendererType,
    _options: DispatchOptions
  ) => {},
  extendFromPlugin: (_plugin: RendererPlugin, _options: DispatchOptions) => {},
});

interface DynamicComponentLoaderProps<P> {
  component: React.ComponentType<P>;
}

interface DynamicComponentLoaderProps<P> {
  component: React.ComponentType<P>;
}

const DynamicComponentLoader = <P extends object>({
  component: Component,
  ...props
}: DynamicComponentLoaderProps<P> & P): JSX.Element => {
  return <Component {...(props as P)} />;
};

export { RenderMappingContext, RenderMappingProvider, DynamicComponentLoader };
export type {
  RenderMappingState,
  extend_input_renderer_action,
  extend_handle_preview_renderer_action,
  extend_data_overlay_renderer_action,
  extend_data_preview_renderer_action,
  extend_data_view_renderer_action,
  extend_from_plugin_action,
  renderMappingAction,
  HandlePreviewRendererType,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
};