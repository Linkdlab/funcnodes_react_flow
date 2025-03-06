import * as React from "react";
import { JSX, ReactElement, createContext, useEffect, useReducer } from "react";
import {
  IOType,
  InputRendererType,
  OutputRendererType,
} from "../../states/nodeio.t";
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
  SVGImageOutput,
  DictOutput,
  SingleValueOutput,
  TableOutput,
  Base64BytesOutput,
  Base64BytesInLineOutput,
} from "./default_preview_renderer";
import RendererPlugin from "../../plugin/renderer";

import FuncNodesReactPlugin from "../../plugin";
import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";
import { NodeType } from "../../states/node.t";
import { NodeContext } from "../node/node";

const _Inputrenderer: {
  [key: string]: InputRendererType | undefined;
} = {
  float: FloatInput,
  int: IntegerInput,
  bool: BooleanInput,
  string: StringInput,
  str: StringInput,
  color: ColorInput,
  select: SelectionInput,
  enum: SelectionInput,
  bytes: Base64BytesOutput,
};
const _Outputrenderer: {
  [key: string]: OutputRendererType | undefined;
} = {};

type HandlePreviewRendererType = ({ io }: { io: IOType }) => JSX.Element;
const _HandlePreviewGenerators: {
  [key: string]: HandlePreviewRendererType | undefined;
} = {
  bytes: Base64BytesOutput,
};

type InLineRendererType = ({ io }: { io: IOType }) => string;
const _InLineGenerators: {
  [key: string]: InLineRendererType | undefined;
} = {
  bytes: Base64BytesInLineOutput,
};

type DataOverlayRendererType = ({ io }: { io: IOType }) => JSX.Element;
const _DataOverlayViewGenerators: {
  [key: string]: DataOverlayRendererType | undefined;
} = {};

type DataPreviewViewRendererType = ({ io }: { io: IOType }) => JSX.Element;

const _DataPreviewViewRenderer: {
  [key: string]: DataPreviewViewRendererType | undefined;
} = {
  string: SingleValueOutput,
  table: TableOutput,
  image: Base64ImageOutput,
  svg: SVGImageOutput,
  dict: DictOutput,
  bytes: Base64BytesOutput,
};

type DataViewRendererType = ({ io }: { io: IOType }) => JSX.Element;
const _DataViewRenderer: {
  [key: string]: DataViewRendererType | undefined;
} = {};

type NodeRendererType = ({ node_data }: { node_data: NodeType }) => JSX.Element;
const _NodeRenderer: {
  [key: string]: NodeRendererType | undefined;
} = {};

type NodeContextExtenderType = ({ node_data }: { node_data: NodeType }) => {
  [key: string]: any;
};
const _NodeContextExtenders: {
  [key: string]: NodeContextExtenderType | undefined;
} = {};

interface RenderMappingState {
  Inputrenderer: {
    [key: string]: InputRendererType | undefined;
  };
  Outputrenderer: {
    [key: string]: OutputRendererType | undefined;
  };
  HandlePreviewRenderer: {
    [key: string]: HandlePreviewRendererType | undefined;
  };
  DataOverlayRenderer: {
    [key: string]: DataOverlayRendererType | undefined;
  };
  DataPreviewViewRenderer: {
    [key: string]: DataPreviewViewRendererType | undefined;
  };
  DataViewRenderer: {
    [key: string]: DataViewRendererType | undefined;
  };
  InLineRenderer: {
    [key: string]: InLineRendererType | undefined;
  };
  NodeContextExtenders: {
    [key: string]: NodeContextExtenderType | undefined;
  };
  NodeRenderer: {
    [key: string]: NodeRendererType | undefined;
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

interface extend_output_renderer_action {
  type: "EXTEND_OUTPUT_RENDER";
  payload: {
    type: string;
    component: OutputRendererType;
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

interface extend_node_context_extender_action {
  type: "EXTEND_NODE_CONTEXT_EXTENDER";
  payload: {
    type: string;
    component: NodeContextExtenderType;
  };
  options?: DispatchOptions;
}

interface extend_node_renderer_action {
  type: "EXTEND_NODE_RENDERER";
  payload: {
    type: string;
    component: NodeRendererType;
  };
  options?: DispatchOptions;
}

type renderMappingAction =
  | extend_input_renderer_action
  | extend_output_renderer_action
  | extend_handle_preview_renderer_action
  | extend_data_overlay_renderer_action
  | extend_data_preview_renderer_action
  | extend_data_view_renderer_action
  | extend_from_plugin_action
  | extend_node_context_extender_action
  | extend_node_renderer_action;

const _initialRenderMappings: RenderMappingState = {
  Inputrenderer: _Inputrenderer,
  Outputrenderer: _Outputrenderer,
  HandlePreviewRenderer: _HandlePreviewGenerators,
  DataOverlayRenderer: _DataOverlayViewGenerators,
  DataPreviewViewRenderer: _DataPreviewViewRenderer,
  DataViewRenderer: _DataViewRenderer,
  InLineRenderer: _InLineGenerators,
  NodeContextExtenders: _NodeContextExtenders,
  NodeRenderer: _NodeRenderer,
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
    case "EXTEND_OUTPUT_RENDER":
      if (!overwrite && state.Outputrenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        Outputrenderer: {
          ...state.Outputrenderer,
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
    case "EXTEND_NODE_CONTEXT_EXTENDER":
      if (!overwrite && state.NodeContextExtenders[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        NodeContextExtenders: {
          ...state.NodeContextExtenders,
          [action.payload.type]: action.payload.component,
        },
      };
    case "EXTEND_NODE_RENDERER":
      if (!overwrite && state.NodeRenderer[action.payload.type]) {
        return state;
      }
      return {
        ...state,
        NodeRenderer: {
          ...state.NodeRenderer,
          [action.payload.type]: action.payload.component,
        },
      };
    case "EXTEND_FROM_PLUGIN":
      let something_new = false;

      const checkpairs = [
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
        [
          action.payload.plugin.node_context_extenders || {},
          state.NodeContextExtenders,
        ],
        [action.payload.plugin.node_renderers || {}, state.NodeRenderer],
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

      for (const [new_renderer, old_renderer] of checkpairs) {
        for (const key in new_renderer) {
          if (overwrite || !old_renderer[key]) {
            old_renderer[key] = new_renderer[key];
          }
        }
      }

      const newstate = { ...state };
      return newstate;

    default:
      return state;
  }
};

/**
 * RenderMappingProvider is a React component that provides a context for managing and extending the mappings of input renderers, handle preview renderers, data overlay renderers, data preview view renderers, and data view renderers. These mappings are used throughout the application to render various types of inputs, previews, and data views dynamically.

 * The provider initializes with a set of default mappings and allows these mappings to be extended or overwritten via actions dispatched within the component's reducer. Additionally, it can automatically integrate renderer plugins, extending the functionality based on the provided plugins.

 * @param {object} props - The props object for the RenderMappingProvider component.
 * @param {ReactElement} props.children - The child components that will be wrapped by the provider.
 * @param {object} props.plugins - An object containing various FuncNodesReactPlugin instances, which may include renderer plugins to be integrated into the render mappings.

 * @returns {JSX.Element} A JSX element that provides the render mapping context to its children.

 * Context Value:
 * The context value provided by this component includes the following properties and functions:
 * - Inputrenderer: A mapping of input types to their corresponding renderer components.
 * - Outputrenderer: A mapping of output types to their corresponding renderer components.
 * - HandlePreviewRenderer: A mapping of handle preview types to their corresponding renderer components.
 * - DataOverlayRenderer: A mapping of data overlay types to their corresponding renderer components.
 * - DataPreviewViewRenderer: A mapping of data preview view types to their corresponding renderer components.
 * - DataViewRenderer: A mapping of data view types to their corresponding renderer components.
 * - extendInputRenderMapping: A function to extend the input renderer mapping.
 * - extendOutputRenderMapping: A function to extend the output renderer mapping.
 * - extendHandlePreviewRenderMapping: A function to extend the handle preview renderer mapping.
 * - extendDataOverlayRenderMapping: A function to extend the data overlay renderer mapping.
 * - extendDataPreviewRenderMapping: A function to extend the data preview view renderer mapping.
 * - extendDataViewRenderMapping: A function to extend the data view renderer mapping.
 * - extendFromPlugin: A function to extend all relevant mappings from a given renderer plugin.

 * Example usage:
 * ```jsx
 * <RenderMappingProvider plugins={myPlugins}>
 *   <MyComponent />
 * </RenderMappingProvider>
 * ```
 */
const RenderMappingProvider = ({
  children,
  plugins,
  fnrf_zst,
}: {
  children: ReactElement;
  plugins: {
    [key: string]: FuncNodesReactPlugin;
  };
  fnrf_zst: FuncNodesReactFlowZustandInterface;
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

  const extendOutputRenderMapping = (
    type: string,
    component: OutputRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_OUTPUT_RENDER",
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

  const extendNodeContextExtender = (
    type: string,
    component: NodeContextExtenderType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_NODE_CONTEXT_EXTENDER",
      payload: { type, component },
      options,
    });
  };

  const extendNodeRenderer = (
    type: string,
    component: NodeRendererType,
    options?: DispatchOptions
  ) => {
    dispatch({
      type: "EXTEND_NODE_RENDERER",
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
      const renderplugin = plugins[plugin].RendererPlugin;
      if (renderplugin) extendFromPlugin(renderplugin);
      const renderpluginfactory = plugins[plugin].renderpluginfactory;
      if (renderpluginfactory) {
        extendFromPlugin(renderpluginfactory({ React, fnrf_zst, NodeContext }));
      }
    }
  }, [plugins]);

  return (
    <RenderMappingContext.Provider
      value={{
        Inputrenderer: state.Inputrenderer,
        Outputrenderer: state.Outputrenderer,
        HandlePreviewRenderer: state.HandlePreviewRenderer,
        DataOverlayRenderer: state.DataOverlayRenderer,
        DataPreviewViewRenderer: state.DataPreviewViewRenderer,
        DataViewRenderer: state.DataViewRenderer,
        InLineRenderer: state.InLineRenderer,
        NodeContextExtenders: state.NodeContextExtenders,
        NodeRenderer: state.NodeRenderer,
        extendInputRenderMapping,
        extendOutputRenderMapping,
        extendHandlePreviewRenderMapping,
        extendDataOverlayRenderMapping,
        extendDataPreviewRenderMapping,
        extendDataViewRenderMapping,
        extendNodeContextExtender,
        extendNodeRenderer,
        extendFromPlugin,
      }}
    >
      {children}
    </RenderMappingContext.Provider>
  );
};

const RenderMappingContext = createContext({
  Inputrenderer: _initialRenderMappings.Inputrenderer,
  Outputrenderer: _initialRenderMappings.Outputrenderer,
  HandlePreviewRenderer: _initialRenderMappings.HandlePreviewRenderer,
  DataOverlayRenderer: _initialRenderMappings.DataOverlayRenderer,
  DataPreviewViewRenderer: _initialRenderMappings.DataPreviewViewRenderer,
  DataViewRenderer: _initialRenderMappings.DataViewRenderer,
  InLineRenderer: _initialRenderMappings.InLineRenderer,
  NodeContextExtenders: _initialRenderMappings.NodeContextExtenders,
  NodeRenderer: _initialRenderMappings.NodeRenderer,
  extendInputRenderMapping: (
    _type: string,
    _component: InputRendererType,
    _options: DispatchOptions
  ) => {},
  extendOutputRenderMapping: (
    _type: string,
    _component: OutputRendererType,
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
  extendNodeContextExtender: (
    _type: string,
    _component: NodeContextExtenderType,
    _options: DispatchOptions
  ) => {},
  extendNodeRenderer: (
    _type: string,
    _component: NodeRendererType,
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
  extend_output_renderer_action,
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
  NodeRendererType,
  NodeContextExtenderType,
};
