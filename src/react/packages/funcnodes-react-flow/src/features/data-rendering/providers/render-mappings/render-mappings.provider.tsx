import * as React from "react";
import {
  ReactElement,
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";

import { NodeContext } from "@/nodes";
import {
  renderMappingReducer,
  initialRenderMappings,
} from "./render-mappings.reducer";
import {
  DispatchOptions,
  NodeHooksType,
  NodeRendererType,
} from "./render-mappings.types";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
  DataViewRendererType,
  HandlePreviewRendererType,
  InputRendererType,
  OutputRendererType,
} from "@/data-rendering-types";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { FuncNodesReactPlugin, RendererPlugin } from "@/plugins";

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
export const RenderMappingProvider = ({
  children,
  plugins,
  fnrf_zst,
}: {
  children: ReactElement;
  plugins: {
    [key: string]: FuncNodesReactPlugin | undefined;
  };
  fnrf_zst: FuncNodesReactFlow;
}) => {
  const [state, dispatch] = useReducer(
    renderMappingReducer,
    initialRenderMappings
  );

  const extendInputRenderMapping = useCallback(
    (
      type: string,
      component: InputRendererType,
      options?: DispatchOptions
    ) => {
      dispatch({
        type: "EXTEND_INPUT_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendOutputRenderMapping = useCallback(
    (
      type: string,
      component: OutputRendererType,
      options?: DispatchOptions
    ) => {
      dispatch({
        type: "EXTEND_OUTPUT_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendHandlePreviewRenderMapping = useCallback(
    (
      type: string,
      component: HandlePreviewRendererType,
      options?: DispatchOptions
    ) => {
      dispatch({
        type: "EXTEND_HANDLE_PREVIEW_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendDataOverlayRenderMapping = useCallback(
    (
      type: string,
      component: DataOverlayRendererType,
      options?: DispatchOptions
    ) => {
      dispatch({
        type: "EXTEND_DATA_OVERLAY_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendDataPreviewRenderMapping = useCallback(
    (
      type: string,
      component: DataPreviewViewRendererType,
      options?: DispatchOptions
    ) => {
      dispatch({
        type: "EXTEND_DATA_PREVIEW_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendDataViewRenderMapping = useCallback(
    (type: string, component: DataViewRendererType, options?: DispatchOptions) => {
      dispatch({
        type: "EXTEND_DATA_VIEW_RENDER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendNodeRenderer = useCallback(
    (type: string, component: NodeRendererType, options?: DispatchOptions) => {
      dispatch({
        type: "EXTEND_NODE_RENDERER",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendNodeHooks = useCallback(
    (type: string, component: NodeHooksType[], options?: DispatchOptions) => {
      dispatch({
        type: "EXTEND_NODE_HOOKS",
        payload: { type, component },
        options,
      });
    },
    []
  );

  const extendFromPlugin = useCallback(
    (plugin: RendererPlugin, options?: DispatchOptions) => {
      dispatch({
        type: "EXTEND_FROM_PLUGIN",
        payload: { plugin },
        options,
      });
    },
    []
  );

  useEffect(() => {
    for (const pluginname in plugins) {
      const plugin = plugins[pluginname];
      if (!plugin) continue;
      const renderpluginfactory = plugin.renderpluginfactory;
      if (renderpluginfactory) {
        extendFromPlugin(renderpluginfactory({ React, fnrf_zst, NodeContext }));
      }
    }
  }, [plugins, extendFromPlugin, fnrf_zst]);

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
        NodeRenderer: state.NodeRenderer,
        NodeHooks: state.NodeHooks,
        extendNodeRenderer,
        extendInputRenderMapping,
        extendOutputRenderMapping,
        extendHandlePreviewRenderMapping,
        extendDataOverlayRenderMapping,
        extendDataPreviewRenderMapping,
        extendDataViewRenderMapping,
        extendNodeHooks,
        extendFromPlugin,
      }}
    >
      {children}
    </RenderMappingContext.Provider>
  );
};

export const RenderMappingContext = createContext({
  Inputrenderer: initialRenderMappings.Inputrenderer,
  Outputrenderer: initialRenderMappings.Outputrenderer,
  HandlePreviewRenderer: initialRenderMappings.HandlePreviewRenderer,
  DataOverlayRenderer: initialRenderMappings.DataOverlayRenderer,
  DataPreviewViewRenderer: initialRenderMappings.DataPreviewViewRenderer,
  DataViewRenderer: initialRenderMappings.DataViewRenderer,
  InLineRenderer: initialRenderMappings.InLineRenderer,
  NodeRenderer: initialRenderMappings.NodeRenderer,
  NodeHooks: initialRenderMappings.NodeHooks,
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

  extendNodeRenderer: (
    _type: string,
    _component: NodeRendererType,
    _options: DispatchOptions
  ) => {},
  extendNodeHooks: (
    _type: string,
    _component: NodeHooksType[],
    _options: DispatchOptions
  ) => {},
  extendFromPlugin: (_plugin: RendererPlugin, _options: DispatchOptions) => {},
});
