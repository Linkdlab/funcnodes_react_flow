import { Connection } from '@xyflow/react';
import { Edge } from '@xyflow/react';
import { EdgeChange } from '@xyflow/react';
import { JSX } from 'react';
import { Node as Node_2 } from '@xyflow/react';
import { NodeChange } from '@xyflow/react';
import { NodeDimensionChange } from '@xyflow/react';
import { NodePositionChange } from '@xyflow/react';
import { OnConnect } from '@xyflow/react';
import { OnEdgesChange } from '@xyflow/react';
import { OnNodesChange } from '@xyflow/react';
import * as React_2 from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { RJSFSchema } from '@rjsf/utils';
import { StoreApi } from 'zustand';
import { UiSchema } from '@rjsf/utils';
import { UseBoundStore } from 'zustand';
import { useReactFlow } from '@xyflow/react';

/**
 * Abstract base class for handler classes.
 */
declare abstract class AbstractFuncNodesReactFlowHandleHandler {
    protected context: FuncNodesReactFlowHandlerContext;
    constructor(context: FuncNodesReactFlowHandlerContext);
    protected get nodespaceManager(): NodeSpaceManager;
    protected get libManager(): LibManager;
    protected get workerManager(): WorkerManagerHandler;
    protected get stateManager(): StateManagerHandler;
    protected get pluginManager(): PluginManagerHandler;
    protected get reactFlowManager(): ReactFlowManagerHandler;
}

/**
 * Abstract base class for handler classes.
 */
declare abstract class AbstractWorkerHandler {
    protected context: WorkerHandlerContext;
    constructor(context: WorkerHandlerContext);
    abstract start(): void;
    abstract stop(): void;
    protected get communicationManager(): WorkerCommunicationManager;
    protected get eventManager(): WorkerEventManager;
    protected get hookManager(): WorkerHookManager;
    protected get nodeManager(): WorkerNodeManager;
    protected get syncManager(): WorkerSyncManager;
    protected get connectionHealthManager(): WorkerConnectionHealthManager;
    protected get edgeManager(): WorkerEdgeManager;
    protected get groupManager(): WorkerGroupManager;
    protected get libraryManager(): WorkerLibraryManager;
}

declare interface AllOf {
    allOf: SerializedType[];
}

declare type AnyDataType = JSONType | ArrayBuffer | Blob;

declare interface AnyOf {
    anyOf: SerializedType[];
}

export declare class ArrayBufferDataStructure extends DataStructure<ArrayBuffer, string> {
    private _objectUrl;
    constructor({ data, mime }: {
        data: BinarySource;
        mime: string;
    });
    get objectUrl(): string;
    dispose(): void;
    get value(): string;
}

declare interface ArrayOf {
    type: "array";
    items: SerializedType;
    uniqueItems: boolean;
}

declare interface AvailableModule {
    name: string;
    description: string;
    homepage: string;
    source: string;
    version: string;
    releases: string[];
}

declare interface BaseEdgeAction {
    type: string;
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
    from_remote: boolean;
}

declare interface BaseGroupAction {
    type: string;
    id: string;
    group: Partial<NodeGroup>;
    from_remote: boolean;
    immediate?: boolean;
}

declare interface BaseNodeAction {
    type: string;
    from_remote: boolean;
    id: string;
    immediate?: boolean;
}

declare interface BaseRenderOptions {
    type: RenderType;
}

declare type BasicDataOverlayRendererType = (props: DataOverlayRendererProps) => JSX.Element;

declare type BasicDataPreviewViewRendererType = (props: DataPreviewViewRendererProps) => JSX.Element;

declare type BasicDataViewRendererType = (props: DataViewRendererProps) => JSX.Element;

declare type BasicHandlePreviewRendererType = (props: HandlePreviewRendererProps) => JSX.Element;

declare type BasicInputRendererType = (props: InputRendererProps) => JSX.Element;

declare interface BasicIOType {
    connected: boolean;
    does_trigger: boolean;
    full_id: string;
    id: string;
    is_input: boolean;
    name: string;
    node: string;
    type: SerializedType;
    render_options: IORenderOptions;
    value_options?: IOValueOptions;
    valuepreview_type?: string;
    hidden: boolean;
    emit_value_set: boolean;
    default?: any;
    required: boolean;
}

declare interface BasicNodeType {
    id: string;
    node_id: string;
    node_name: string;
    name: string;
    error?: string;
    render_options?: DeepPartial<NodeRenderOptions>;
    description?: string;
    properties: NodeProperties;
    reset_inputs_on_trigger: boolean;
    status?: {
        [key: string]: any | undefined;
    };
}

declare type BasicOutputRendererType = (props: OutputRendererProps) => JSX.Element;

declare type BinarySource = ArrayBufferLike | ArrayBufferView;

export declare class CTypeStructure extends DataStructure<ArrayBuffer, string | number | boolean | null> {
    private _cType;
    private _value;
    constructor({ data, mime }: {
        data: BinarySource;
        mime: string;
    });
    parse_value(): string | number | boolean | null;
    get value(): string | number | boolean | null;
    toString(): string;
}

export declare interface DataOverlayRendererProps {
    value: any;
    preValue?: any;
    onLoaded?: () => void;
}

export declare type DataOverlayRendererType = BasicDataOverlayRendererType | React.MemoExoticComponent<BasicDataOverlayRendererType>;

export declare type DataPreviewViewRendererProps = {};

export declare const DataPreviewViewRendererToHandlePreviewRenderer: (DPR: DataPreviewViewRendererType) => HandlePreviewRendererType;

export declare type DataPreviewViewRendererType = BasicDataPreviewViewRendererType | React.MemoExoticComponent<BasicDataPreviewViewRendererType>;

declare interface DataRenderOptions extends BaseRenderOptions {
    src?: string;
    preview_type?: string;
}

/**
 * Base class for wrapping data with MIME type information.
 * Provides a consistent interface for accessing typed data with metadata.
 *
 * @template D - The type of the wrapped data, must extend AnyDataType
 * @template R - The return type when accessing the value property, must extend JSONType or be undefined
 *
 * @example
 * ```typescript
 * const textData = new DataStructure({
 *   data: "Hello World",
 *   mime: "text/plain"
 * });
 * console.log(textData.data); // "Hello World"
 * console.log(textData.mime); // "text/plain"
 * ```
 */
export declare class DataStructure<D extends AnyDataType, R extends JSONType | undefined> {
    /** The wrapped data */
    private _data;
    /** MIME type describing the data format */
    private _mime;
    /**
     * Creates a new DataStructure instance.
     *
     * @param props - Configuration object containing data and MIME type
     */
    constructor({ data, mime }: DataStructureProps<D>);
    /**
     * Gets the raw wrapped data.
     *
     * @returns The original data in its native type
     */
    get data(): D;
    /**
     * Gets the data cast to the expected return type.
     * This is a type assertion and should be overridden in subclasses for proper type conversion.
     *
     * @returns The data cast to type R
     */
    get value(): R;
    /**
     * Gets the MIME type of the wrapped data.
     *
     * @returns The MIME type string
     */
    get mime(): string;
    /**
     * Returns a string representation of the DataStructure.
     * The format varies based on the data type:
     * - ArrayBuffer: shows byte length
     * - Blob: shows size
     * - String/Array: shows length
     * - Object: shows number of keys
     * - Other types: shows only MIME type
     *
     * @returns String representation in format "DataStructure(size,mime)" or "DataStructure(mime)"
     */
    toString(): string;
    /**
     * Returns the JSON representation of this DataStructure.
     * Currently delegates to toString() method.
     *
     * @returns JSON string representation
     */
    toJSON(): string;
    /**
     * Cleans up resources associated with this DataStructure.
     * Base implementation does nothing, but subclasses may override to release resources.
     */
    dispose(): void;
}

/**
 * Properties for constructing a DataStructure instance.
 *
 * @template D - The type of data being wrapped, must extend AnyDataType
 */
declare type DataStructureProps<D extends AnyDataType> = {
    /** The actual data to be wrapped */
    data: D;
    /** MIME type string describing the data format */
    mime: string;
};

export declare type DataViewRendererProps = {
    value: JSONType | undefined;
    preValue?: JSONType | undefined;
    onLoaded?: () => void;
};

export declare const DataViewRendererToDataPreviewViewRenderer: (DV: DataViewRendererType, defaultValue?: any, props?: any) => DataPreviewViewRendererType;

export declare const DataViewRendererToInputRenderer: (DV: DataViewRendererType, defaultValue?: any) => InputRendererType;

export declare const DataViewRendererToOverlayRenderer: (DV: DataViewRendererType) => DataOverlayRendererType;

export declare type DataViewRendererType = BasicDataViewRendererType | React.MemoExoticComponent<BasicDataViewRendererType>;

/**
 * Deeply merges two objects, with the source object's properties taking precedence over the target's.
 *
 * This function creates a new object by recursively merging properties from the source object
 * into the target object. Unlike shallow merging, this function traverses nested objects and
 * merges them at each level. The function returns both the merged result and a boolean flag
 * indicating whether any changes were made during the merge process.
 *
 * @template T - The type of the target object and the resulting merged object
 *
 * @param target - The base object that will be merged with the source. Must be a plain object.
 * @param source - The object whose properties will override or extend the target object.
 *                Can be a partial representation of T with any level of nesting optional.
 *
 * @returns An object containing:
 *          - `new_obj`: A new object of type T with merged properties
 *          - `change`: Boolean indicating if any modifications were made during merging
 *
 * @throws {Error} Throws an error if either target or source is not a plain object
 *
 * @example
 * ```typescript
 * const target = {
 *   user: { name: 'John', age: 30 },
 *   settings: { theme: 'light', lang: 'en' }
 * };
 *
 * const source = {
 *   user: { age: 31 },           // Will override age, keep name
 *   settings: { theme: 'dark' }   // Will override theme, keep lang
 * };
 *
 * const result = deep_merge(target, source);
 * // result.new_obj = {
 * //   user: { name: 'John', age: 31 },
 * //   settings: { theme: 'dark', lang: 'en' }
 * // }
 * // result.change = true
 * ```
 *
 * @example
 * ```typescript
 * // No changes scenario
 * const target = { a: 1, b: { c: 2 } };
 * const source = { a: 1, b: { c: 2 } };
 * const result = deep_merge(target, source);
 * // result.new_obj = { a: 1, b: { c: 2 } }
 * // result.change = false
 * ```
 *
 * @note This function creates a new object rather than modifying the target in place.
 * @note The function uses deep_compare_objects to determine if changes actually occurred.
 * @note Nested objects are recursively merged, but arrays and other object types are replaced entirely.
 *
 * @see DeepPartial - Type used for the source parameter
 * @see deep_compare_objects - Used to detect changes during merging
 * @see isPlainObject - Used to validate object types
 * @see deep_update - Alternative function for adding missing properties only
 */
export declare const deep_merge: <T extends {}>(target: T, source: DeepPartial<T>) => {
    new_obj: T;
    change: boolean;
};

/**
 * Deeply updates the target object by adding missing properties from the source object.
 *
 * Unlike deep_merge which overwrites existing properties, deep_update only adds properties
 * that are missing (undefined) in the target object. This is useful for filling in default
 * values or ensuring an object has all required properties without overwriting existing data.
 * The function recursively processes nested objects to add missing properties at any depth.
 *
 * @template T - The type of the complete object structure (source object type)
 *
 * @param target - A partial object that may be missing some properties. Can have any subset
 *                of properties from T, with nested objects also being partial.
 * @param source - A complete object of type T that provides the default/missing values.
 *                This object should contain all the properties that might be missing from target.
 *
 * @returns An object containing:
 *          - `new_obj`: A complete object of type T with all properties filled in
 *          - `change`: Boolean indicating if any properties were added during the update
 *
 * @throws {Error} Throws an error if either target or source is not a plain object
 *
 * @example
 * ```typescript
 * interface Config {
 *   user: { name: string; age: number; email: string };
 *   settings: { theme: string; lang: string; notifications: boolean };
 * }
 *
 * const partialConfig = {
 *   user: { name: 'John' },          // Missing age and email
 *   settings: { theme: 'dark' }       // Missing lang and notifications
 * };
 *
 * const defaultConfig: Config = {
 *   user: { name: 'Anonymous', age: 0, email: 'none@example.com' },
 *   settings: { theme: 'light', lang: 'en', notifications: true }
 * };
 *
 * const result = deep_update(partialConfig, defaultConfig);
 * // result.new_obj = {
 * //   user: { name: 'John', age: 0, email: 'none@example.com' },
 * //   settings: { theme: 'dark', lang: 'en', notifications: true }
 * // }
 * // result.change = true
 * ```
 *
 * @example
 * ```typescript
 * // No changes needed scenario
 * const completeConfig = {
 *   user: { name: 'John', age: 30, email: 'john@example.com' },
 *   settings: { theme: 'dark', lang: 'fr', notifications: false }
 * };
 *
 * const result = deep_update(completeConfig, defaultConfig);
 * // result.new_obj = completeConfig (unchanged)
 * // result.change = false
 * ```
 *
 * @note This function only adds missing properties (undefined values). Existing properties,
 *       even if null or empty, are preserved and not overwritten.
 *
 * @note The function recursively processes nested objects but does not update properties
 *       where the target has a non-object value but the source has an object value.
 *
 * @note This is particularly useful for object factories and default value scenarios.
 *
 * @see LimitedDeepPartial - Type used for the target parameter
 * @see deep_merge - Alternative function that overwrites existing properties
 * @see object_factory_maker - Uses this function for applying partial updates
 * @see isPlainObject - Used to validate object types
 */
export declare const deep_update: <T extends {}>(target: LimitedDeepPartial<T>, source: T) => {
    new_obj: T;
    change: boolean;
};

/**
 * A utility type that makes all properties of an object type T optional recursively.
 *
 * This type is similar to TypeScript's built-in `Partial<T>`, but it applies the optional
 * modifier recursively to all nested objects and their properties. This is particularly
 * useful when you want to create partial updates or configurations where any level of
 * nesting can be optionally specified.
 *
 * @template T - The type to make deeply partial. Can be any type, but the transformation
 *              only applies meaningfully to object types.
 *
 * @example
 * ```typescript
 * interface Config {
 *   app: {
 *     name: string;
 *     version: string;
 *     features: {
 *       darkMode: boolean;
 *       notifications: boolean;
 *     };
 *   };
 *   user: {
 *     id: number;
 *     preferences: {
 *       language: string;
 *       theme: string;
 *     };
 *   };
 * }
 *
 * // All properties at all levels become optional
 * type PartialConfig = DeepPartial<Config>;
 *
 * // Valid partial configurations:
 * const config1: PartialConfig = {}; // Empty object
 * const config2: PartialConfig = { app: { name: "MyApp" } }; // Partial app config
 * const config3: PartialConfig = {
 *   user: {
 *     preferences: { language: "en" }
 *   }
 * }; // Deeply nested partial
 * ```
 *
 * @example
 * ```typescript
 * // With primitive types, the type remains unchanged
 * type PartialString = DeepPartial<string>; // string
 * type PartialNumber = DeepPartial<number>; // number
 * type PartialBoolean = DeepPartial<boolean>; // boolean
 *
 * // With arrays, the array itself becomes optional but elements keep their type
 * type PartialArray = DeepPartial<string[]>; // string[] | undefined
 * ```
 *
 * @note This type uses conditional types and mapped types to recursively apply the
 *       optional modifier. For non-object types (primitives, functions, etc.), the
 *       original type is returned unchanged.
 *
 * @note Arrays are treated as objects, so `DeepPartial<T[]>` results in `T[]?` rather
 *       than `(DeepPartial<T>)[]?`. If you need the array elements to also be deeply
 *       partial, consider using a more specialized type.
 *
 * @see LimitedDeepPartial - A depth-limited version of this type to prevent infinite recursion
 * @see deep_merge - Function that works well with DeepPartial types for object merging
 * @see deep_update - Function that accepts DeepPartial-like objects for updating
 */
export declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

declare interface DevSettings {
    debug: boolean;
}

declare interface DictOf {
    type: "object";
    keys: SerializedType;
    values: SerializedType;
}

declare type EdgeAction = EdgeActionAdd | EdgeActionDelete;

declare interface EdgeActionAdd extends BaseEdgeAction {
    type: "add";
}

declare interface EdgeActionDelete extends BaseEdgeAction {
    type: "delete";
}

declare interface EnumOf {
    type: "enum";
    values: (number | string | boolean | null)[];
    keys: string[];
    nullable: boolean;
}

declare interface ErrorMessage {
    type: "error";
    error: string;
    tb: string[];
    id?: string;
}

declare interface ExternalWorkerClassDep {
    module: string;
    class_name: string;
    name: string;
    instances: ExternalWorkerInstance[];
}

declare interface ExternalWorkerDependencies {
    module: string;
    worker_classes: ExternalWorkerClassDep[];
}

declare interface ExternalWorkerInstance {
    uuid: string;
    nodeclassid: string;
    running: boolean;
    name: string;
}

export declare const FuncNodes: (props: LimitedDeepPartial<FuncnodesReactFlowProps>) => React_2.JSX.Element;

declare class FuncNodesReactFlow implements FuncNodesReactFlowZustandInterface {
    options: FuncnodesReactFlowProps;
    reactflowRef: HTMLDivElement | null;
    logger: Logger;
    dev_settings: DevSettings;
    private _nodespaceManager;
    private _libManager;
    private _workerManager;
    private _stateManager;
    private _pluginManager;
    private _reactFlowManager;
    constructor(props: FuncnodesReactFlowProps);
    getNodespaceManager(): NodeSpaceManager;
    getLibManager(): LibManager;
    getWorkerManager(): WorkerManagerHandler;
    getStateManager(): StateManagerHandler;
    getPluginManager(): PluginManagerHandler;
    getReactFlowManager(): ReactFlowManagerHandler;
    get nodespace(): NodeSpaceZustandInterface;
    get on_node_action(): (action: NodeAction) => NodeType | undefined;
    get on_edge_action(): (action: EdgeAction) => void;
    get on_group_action(): (action: GroupAction) => void;
    get clear_all(): () => void;
    get center_node(): (node_id: string | string[]) => void;
    get center_all(): () => void;
    get lib(): LibZustandInterface;
    get set_worker(): (worker: FuncNodesWorker | undefined) => void;
    get workermanager(): WorkerManagerHandler["workermanager"];
    set workermanager(manager: WorkerManagerHandler["workermanager"]);
    get worker(): FuncNodesWorker | undefined;
    get workers(): UseBoundStore<StoreApi<WorkersState>>;
    get workerstate(): UseBoundStore<StoreApi<FuncNodesWorkerState>>;
    get _unsubscribeFromWorker(): (() => void) | undefined;
    get set_progress(): (progress: ProgressState) => void;
    get auto_progress(): () => void;
    get progress_state(): UseBoundStore<StoreApi<ProgressState>>;
    get local_settings(): UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
    get local_state(): UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
    update_view_settings(settings: FuncnodesReactFlowViewSettings): void;
    get plugins(): UseBoundStore<StoreApi<{
        [key: string]: FuncNodesReactPlugin | undefined;
    }>>;
    get add_plugin(): (name: string, plugin: VersionedFuncNodesReactPlugin) => void;
    get add_packed_plugin(): (name: string, plugin: PackedPlugin) => Promise<void>;
    get render_options(): UseBoundStore<StoreApi<RenderOptions>>;
    get update_render_options(): (options: RenderOptions) => void;
    get useReactFlowStore(): RFStore;
    get rf_instance(): ReactFlowManagerHandler["rf_instance"];
    set rf_instance(instance: ReactFlowManagerHandler["rf_instance"]);
}

/**
 * Defines the required context for handler classes, providing access
 * to the parent worker instance.
 */
declare interface FuncNodesReactFlowHandlerContext {
    rf: FuncNodesReactFlow;
}

declare interface FuncnodesReactFlowLocalSettings {
    view_settings: FuncnodesReactFlowViewSettings;
}

declare interface FuncnodesReactFlowLocalState {
    selected_nodes: string[];
    selected_edges: string[];
    selected_groups: string[];
    funcnodescontainerRef: HTMLDivElement | null;
}

export declare interface FuncnodesReactFlowProps {
    id: string;
    debug: boolean;
    on_sync_complete?: (worker: FuncNodesWorker) => Promise<void>;
    useWorkerManager: boolean;
    show_library: boolean;
    load_worker?: string;
    worker?: FuncNodesWorker;
    header: FuncnodesReactHeaderProps;
    flow: ReactFlowLayerProps;
    library: ReactFlowLibraryProps;
    worker_url?: string;
    fnw_url?: string;
    workermanager_url?: string;
    logger?: Logger;
    on_ready?: ({ fnrf_zst }: {
        fnrf_zst: FuncNodesReactFlow;
    }) => void;
}

declare interface FuncnodesReactFlowViewSettings {
    expand_node_props?: boolean;
    expand_lib?: boolean;
}

declare interface FuncNodesReactFlowZustandInterface {
    options: FuncnodesReactFlowProps;
    local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
    update_view_settings: (settings: FuncnodesReactFlowViewSettings) => void;
    local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
    lib: LibZustandInterface;
    workermanager: WorkerManager | undefined;
    workers: UseBoundStore<StoreApi<WorkersState>>;
    workerstate: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
    worker: FuncNodesWorker | undefined;
    set_worker: (worker: FuncNodesWorker | undefined) => void;
    _unsubscribeFromWorker: (() => void) | undefined;
    nodespace: NodeSpaceZustandInterface;
    useReactFlowStore: RFStore;
    render_options: UseBoundStore<StoreApi<RenderOptions>>;
    progress_state: UseBoundStore<StoreApi<ProgressState>>;
    update_render_options: (options: RenderOptions) => void;
    rf_instance?: ReturnType<typeof useReactFlow>;
    on_node_action: (action: NodeAction) => NodeType | undefined;
    on_edge_action: (edge: EdgeAction) => void;
    on_group_action: (group: GroupAction) => void;
    set_progress: (progress: ProgressState) => void;
    auto_progress: () => void;
    plugins: UseBoundStore<StoreApi<{
        [key: string]: FuncNodesReactPlugin | undefined;
    }>>;
    add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
    reactflowRef: HTMLDivElement | null;
    clear_all: () => void;
    center_node: (node_id: string | string[]) => void;
    center_all: () => void;
    dev_settings: DevSettings;
    logger: Logger;
}

declare interface FuncnodesReactHeaderProps {
    show: boolean;
    showmenu: boolean;
}

export declare type FuncNodesReactPlugin = VersionedFuncNodesReactPlugin<typeof LATEST_VERSION>;

export declare const FuncNodesRenderer: (id_or_element: string | HTMLElement, options?: Partial<FuncnodesReactFlowProps>) => void;

export declare class FuncNodesWorker {
    _zustand?: FuncNodesReactFlow;
    uuid: string;
    private _connectionhealthManager;
    private _communicationManager;
    private _eventManager;
    private _syncManager;
    private _hookManager;
    private _nodeManager;
    private _edgeManager;
    private _groupManager;
    private _libraryManager;
    getEventManager(): WorkerEventManager;
    getSyncManager(): WorkerSyncManager;
    getCommunicationManager(): WorkerCommunicationManager;
    getConnectionHealthManager(): WorkerConnectionHealthManager;
    getHookManager(): WorkerHookManager;
    getNodeManager(): WorkerNodeManager;
    getEdgeManager(): WorkerEdgeManager;
    getGroupManager(): WorkerGroupManager;
    getLibraryManager(): WorkerLibraryManager;
    state: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
    readonly api: WorkerAPI;
    on_error: (error: any) => void;
    constructor(data: WorkerProps);
    set_zustand(zustand: FuncNodesReactFlow): void;
    get is_open(): boolean;
    set is_open(v: boolean);
    get is_responsive(): boolean;
    clear(): Promise<any>;
    save(): Promise<any>;
    load(data: any): Promise<void>;
    get_runstate(): Promise<any>;
    send(_data: any): Promise<void>;
    upload_file(_params: {
        files: File[] | FileList;
        onProgressCallback?: (loaded: number, total?: number) => void;
        root?: string;
    }): Promise<string>;
    handle_large_message_hint({}: LargeMessageHint): Promise<void>;
    disconnect(): void;
    onclose(): void;
    reconnect(): Promise<void>;
    stop(): Promise<void>;
    update_external_worker(worker_id: string, class_id: string, data: {
        name?: string;
        config?: Record<string, any>;
    }): Promise<any>;
    export({ withFiles }: {
        withFiles: boolean;
    }): Promise<any>;
    update_from_export(data: string): Promise<any>;
    /**
     * @deprecated This method is deprecated. Use the API or getCommunicationManager()._send_cmd directly instead.
     */
    _send_cmd(params: Parameters<WorkerCommunicationManager["_send_cmd"]>[0]): Promise<any>;
    /**
     * @deprecated This method is deprecated. Use the API or getNodeManager().set_io_value directly instead.
     */
    set_io_value(params: Parameters<WorkerNodeManagerAPI["set_io_value"]>[0]): Promise<any>;
    /**
     * @deprecated This method is deprecated. Use the API or getNodeManager().get_io_value directly instead.
     */
    get_io_value(params: Parameters<WorkerNodeManagerAPI["get_io_value"]>[0]): Promise<any>;
}

declare interface FuncNodesWorkerState {
    is_open: boolean;
}

declare type GroupAction = GroupActionSet | GroupActionUpdate;

declare interface GroupActionSet {
    type: "set";
    groups: NodeGroups;
}

declare interface GroupActionUpdate extends BaseGroupAction {
    type: "update";
}

declare interface GroupedAvailableModules {
    installed: AvailableModule[];
    available: AvailableModule[];
    active: AvailableModule[];
}

export declare type HandlePreviewRendererProps = {};

export declare type HandlePreviewRendererType = BasicHandlePreviewRendererType | React.MemoExoticComponent<BasicHandlePreviewRendererType>;

export declare interface InLineRendererProps {
}

export declare type InLineRendererType = ({}: InLineRendererProps) => string;

export declare type InputRendererProps = {
    inputconverter: [(v: any) => any, (v: any) => any];
};

export declare type InputRendererType = BasicInputRendererType | React.MemoExoticComponent<BasicInputRendererType>;

declare type IOGetFullValue = () => Promise<any> | undefined;

declare interface IORenderOptions extends BaseRenderOptions {
    set_default: boolean;
    schema?: RJSFSchema;
    uiSchema?: UiSchema;
}

declare interface IOStore {
    io_state: UseJSONStore<IOType>;
    use(): IOType;
    use<U>(selector: (state: IOType) => U): U;
    useShallow<U>(selector: (state: IOType) => U): U;
    getState: () => IOType;
    setState: (new_state: Partial<IOType>) => void;
    update: (new_state: PartialSerializedIOType) => void;
    valuestore: UseBoundStore<StoreApi<ValueStoreInterface>>;
    node: string;
    updateValueStore: (newData: Partial<ValueStoreInterface>) => void;
    serialize: () => SerializedIOType;
}

declare interface IOType extends BasicIOType {
    [key: string]: any | undefined;
}

declare interface IOValueOptions {
    min?: number;
    max?: number;
    step?: number;
    options?: (string | number)[] | EnumOf;
    colorspace?: string;
}

declare type IOValueOptionsSetter = (data: {
    values?: any[];
    keys: string[];
    nullable?: boolean;
}) => void;

declare type IOValueType = string | number | boolean | undefined | DataStructure<any, any>;

declare type JSONMessage = ProgressStateMessage | ResultMessage | ErrorMessage | NodeSpaceEvent | WorkerEvent | LargeMessageHint | PongMessage;

/**
 * Union type representing all supported data types for DataStructure instances.
 * Includes primitive types and binary data.
 */
declare interface JSONObject {
    [key: string]: JSONType;
}

export declare class JSONStructure extends DataStructure<ArrayBuffer, JSONType | undefined> {
    private _json;
    constructor({ data, mime }: {
        data: BinarySource;
        mime: string;
    });
    get value(): JSONType | undefined;
    static fromObject(obj: JSONType): JSONStructure;
    toString(): string;
}

declare type JSONType = string | number | boolean | null | JSONObject | JSONType[];

declare interface LargeMessageHint {
    type: "large_message";
    msg_id: string;
}

export declare const LATEST_VERSION = "1.0.0";

declare class LibManager extends AbstractFuncNodesReactFlowHandleHandler implements LibManagerManagerAPI {
    lib: LibZustandInterface;
    constructor(context: FuncNodesReactFlowHandlerContext);
}

declare interface LibManagerManagerAPI {
}

declare interface LibNode {
    node_id: string;
    description?: string;
    node_name?: string;
}

declare interface LibState {
    lib: LibType;
    external_worker?: ExternalWorkerDependencies[];
    set: (state: {
        lib?: LibType;
        external_worker?: ExternalWorkerDependencies[];
    }) => void;
    get_lib: () => LibType;
    get_external_worker: () => ExternalWorkerDependencies[] | undefined;
}

declare interface LibType {
    shelves: Shelf[];
}

declare interface LibZustandInterface {
    libstate: UseBoundStore<StoreApi<LibState>>;
}

/**
 * A depth-limited version of DeepPartial that prevents infinite recursion by limiting
 * the depth of the optional property transformation.
 *
 * This type is similar to `DeepPartial<T>` but includes a recursion depth limit to prevent
 * TypeScript from hitting infinite recursion errors when dealing with circular type references
 * or very deeply nested object structures. Once the depth limit is reached, the original
 * type T is returned without further transformation.
 *
 * @template T - The type to make deeply partial with depth limitation
 * @template D - The maximum recursion depth (defaults to 10). Must be a number literal type
 *              from the Prev array. When D reaches 0, recursion stops and T is returned as-is.
 *
 * @example
 * ```typescript
 * interface DeepConfig {
 *   level1: {
 *     level2: {
 *       level3: {
 *         value: string;
 *         nested: DeepConfig; // Circular reference
 *       };
 *     };
 *   };
 * }
 *
 * // Safe to use with circular references due to depth limit
 * type PartialConfig = LimitedDeepPartial<DeepConfig, 5>;
 *
 * // Usage examples
 * const config1: PartialConfig = {}; // Valid
 * const config2: PartialConfig = {
 *   level1: {
 *     level2: {
 *       level3: { value: "test" }
 *     }
 *   }
 * }; // Valid - within depth limit
 * ```
 *
 * @example
 * ```typescript
 * // Controlling recursion depth
 * type ShallowPartial = LimitedDeepPartial<MyType, 2>; // Only 2 levels deep
 * type DeepPartial = LimitedDeepPartial<MyType, 15>; // 15 levels deep
 * type DefaultPartial = LimitedDeepPartial<MyType>; // 10 levels deep (default)
 * ```
 *
 * @note The depth parameter D must be a literal number type that exists in the Prev array.
 *       The Prev array defines the available depth values (0-99 in this implementation).
 *
 * @note When the depth limit is reached (D extends 0), the type transformation stops
 *       and the original type T is returned. This means properties at that depth and
 *       beyond will retain their original required/optional status.
 *
 * @note This type is particularly useful when working with recursive data structures,
 *       tree-like objects, or any scenario where DeepPartial might cause TypeScript
 *       compilation issues due to infinite recursion.
 *
 * @see DeepPartial - The unlimited depth version of this type
 * @see Prev - The helper type array that defines available depth values
 * @see deep_update - Function that works with LimitedDeepPartial types
 */
export declare type LimitedDeepPartial<T, D extends number = 10> = D extends 0 ? T : T extends object ? {
    [K in keyof T]?: LimitedDeepPartial<T[K], Prev[D]>;
} : T;

/**
 * Logger interface and utilities for structured logging across the application.
 *
 * This module provides a flexible logging system with multiple output targets
 * and configurable log levels. The logging interface supports lazy formatting
 * through keyword arguments and circular reference handling.
 *
 * @module Logger
 */
/**
 * Logger interface defining the contract for all logger implementations.
 *
 * The log functions take a string message and arbitrary number of keyword arguments
 * that are used for lazy formatting when the log level permits output.
 *
 * @interface Logger
 * @example
 * ```typescript
 * const logger: Logger = new ConsoleLogger("MyApp", INFO);
 * logger.info("User logged in", { userId: 123, timestamp: Date.now() });
 * logger.error("Database connection failed", error);
 * ```
 */
declare interface Logger {
    /**
     * Current logging level. Messages below this level will be filtered out.
     * @type {number}
     */
    level: number;
    /**
     * Set the logging level for this logger instance.
     *
     * @param {number | string} level - The minimum log level to output (DEBUG=0, INFO=10, WARN=20, ERROR=30) or string level name
     * @example
     * ```typescript
     * logger.set_level(DEBUG); // Show all messages
     * logger.set_level("ERROR"); // Show only error messages
     * logger.set_level("debug"); // Case-insensitive string levels
     * ```
     */
    set_level: (level: number | string) => void;
    /**
     * Log a debug message. Only outputs if current level <= DEBUG.
     *
     * @param {string} message - The primary log message
     * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
     * @example
     * ```typescript
     * logger.debug("Processing item", { itemId: 42, step: "validation" });
     * ```
     */
    debug: (message: string, ...args: any[]) => void;
    /**
     * Log an informational message. Only outputs if current level <= INFO.
     *
     * @param {string} message - The primary log message
     * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
     * @example
     * ```typescript
     * logger.info("User action completed", { action: "save", duration: "120ms" });
     * ```
     */
    info: (message: string, ...args: any[]) => void;
    /**
     * Log a warning message. Only outputs if current level <= WARN.
     *
     * @param {string} message - The primary log message
     * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
     * @example
     * ```typescript
     * logger.warn("Deprecated API usage", { api: "/old-endpoint", replacement: "/v2/endpoint" });
     * ```
     */
    warn: (message: string, ...args: any[]) => void;
    /**
     * Log an error message. Only outputs if current level <= ERROR.
     *
     * @param {string} message - The primary log message
     * @param {Error} [error] - Optional Error object for stack trace handling
     * @example
     * ```typescript
     * logger.error("Operation failed", error);
     * ```
     */
    error: (message: string, error?: Error) => void;
}

declare type NodeAction = NodeActionAdd | NodeActionUpdate | NodeActionDelete | NodeActionError | NodeActionTrigger;

declare interface NodeActionAdd extends BaseNodeAction {
    type: "add";
    node: SerializedNodeType;
}

declare interface NodeActionDelete extends BaseNodeAction {
    type: "delete";
}

declare interface NodeActionError extends BaseNodeAction {
    type: "error";
    errortype: string;
    error: string;
    tb?: string;
}

declare interface NodeActionTrigger extends BaseNodeAction {
    type: "trigger";
}

declare interface NodeActionUpdate extends BaseNodeAction {
    type: "update";
    node: PartialSerializedNodeType;
}

declare interface NodeGroup {
    node_ids: string[];
    child_groups: string[];
    parent_group: string | null;
    meta: Record<string, any>;
    position: [number, number];
}

declare interface NodeGroups {
    [key: string]: NodeGroup;
}

export declare type NodeHooksProps = {};

export declare type NodeHooksType = (hookprops: NodeHooksProps) => JSX.Element;

declare interface NodeProperties {
    "frontend:size": [number, number];
    "frontend:pos": [number, number];
    "frontend:collapsed": boolean;
    [key: string]: any | undefined;
}

export declare interface NodeRendererProps {
}

export declare type NodeRendererType = (renderprops: NodeRendererProps) => JSX.Element;

declare interface NodeRenderOptions {
    data?: DataRenderOptions;
}

declare interface NodeSpaceEvent {
    type: "nsevent";
    event: string;
    data: {
        [key: string]: any | undefined;
    };
}

declare class NodeSpaceManager extends AbstractFuncNodesReactFlowHandleHandler implements NodeSpaceManagerAPI {
    nodespace: NodeSpaceZustandInterface;
    constructor(context: FuncNodesReactFlowHandlerContext);
    on_node_action: (action: NodeAction) => NodeType | undefined;
    on_edge_action: (action: EdgeAction) => void;
    on_group_action: (action: GroupAction) => void;
    clear_all: () => void;
    center_node: (node_id: string | string[]) => void;
    center_all(): void;
    auto_resize_group: (gid: string) => void;
    change_group_position: (change: NodePositionChange) => void;
    change_fn_node_position: (change: NodePositionChange) => void;
    change_group_dimensions: (change: NodeDimensionChange) => void;
    change_fn_node_dimensions: (change: NodeDimensionChange) => void;
    _update_group: (action: GroupActionUpdate) => void;
    _set_groups: (groups: NodeGroups) => void;
    _add_node: (action: NodeActionAdd) => NodeType | undefined;
    _update_node: (action: NodeActionUpdate) => NodeType | undefined;
    /**
     * Sync the nodes between the nodespace and the react zustand
     * This is needed because e.g. deleting a node removes it from the react zustand but the nodespace still has it
     * so we need to sync the nodes between the two
     */
    _sync_nodes: () => void;
    _delete_node: (action: NodeActionDelete) => undefined;
    _error_action: (action: NodeActionError) => NodeType | undefined;
    _trigger_action: (action: NodeActionTrigger) => NodeType | undefined;
}

declare interface NodeSpaceManagerAPI {
    on_node_action: (action: NodeAction) => NodeType | undefined;
    on_edge_action: (edge: EdgeAction) => void;
    on_group_action: (group: GroupAction) => void;
    clear_all: () => void;
    center_node: (node_id: string | string[]) => void;
    center_all: () => void;
}

declare interface NodeSpaceZustandInterface {
    nodesstates: Map<string, NodeStore>;
    get_node: (nid: string, raise?: boolean) => NodeStore | undefined;
}

declare interface NodeStore {
    node_state: UseJSONStore<NodeType>;
    io_stores: Map<string, IOStore>;
    use(): NodeType;
    use<U>(selector: (state: NodeType) => U): U;
    useShallow<U>(selector: (state: NodeType) => U): U;
    getState: () => NodeType;
    setState: (new_state: Partial<NodeType>) => void;
    update: (new_state: PartialSerializedNodeType) => void;
    serialize: () => SerializedNodeType;
}

declare interface NodeType extends Omit<BasicNodeType, "in_trigger" | "io"> {
    in_trigger: boolean;
    inputs: string[];
    outputs: string[];
    io_order: string[];
    progress: DeepPartial<TqdmState>;
    [key: string]: any;
}

/**
 * Creates a factory function that generates objects based on a default template with optional customizations.
 *
 * This function returns a factory that can create new instances of objects by:
 * 1. Deep cloning the default object (using JSON serialization)
 * 2. Applying optional factory updates to modify the default object
 * 3. Merging any provided partial object with the result using deep_update
 *
 * @template T - The type of the default object and the objects created by the factory
 *
 * @param default_obj - The template object that serves as the base for all created objects.
 *                     This object will be deep cloned using JSON serialization, so it must be JSON-serializable.
 *
 * @param factory_updates - Optional function that receives the cloned default object and returns
 *                         a modified version. This is useful for applying dynamic updates or
 *                         transformations to the default object before merging with user input.
 *                         If undefined, no modifications are applied to the default object.
 *
 * @returns A factory function that accepts a partial object and returns a complete object of type T.
 *          The returned factory function:
 *          - Takes an optional LimitedDeepPartial<T> parameter for customizations
 *          - Returns a complete object of type T
 *          - If no parameter is provided, returns the (possibly updated) default object
 *          - If a parameter is provided, deep merges it with the default using deep_update
 *
 * @example
 * ```typescript
 * // Basic usage
 * const defaultConfig = { theme: 'light', lang: 'en', features: { darkMode: false } };
 * const configFactory = object_factory_maker(defaultConfig);
 *
 * const config1 = configFactory(); // Returns exact copy of defaultConfig
 * const config2 = configFactory({ theme: 'dark' }); // { theme: 'dark', lang: 'en', features: { darkMode: false } }
 * const config3 = configFactory({ features: { darkMode: true } }); // Nested merge
 *
 * // With factory updates
 * const configFactoryWithUpdates = object_factory_maker(
 *   defaultConfig,
 *   (obj) => ({ ...obj, timestamp: Date.now() })
 * );
 * const config4 = configFactoryWithUpdates({ theme: 'dark' }); // Includes timestamp
 * ```
 *
 * @note The default object must be JSON-serializable since deep cloning is performed using
 *       JSON.stringify/JSON.parse. Objects with functions, undefined values, symbols, or
 *       circular references will not work correctly.
 *
 * @see deep_update - Used internally to merge partial objects with the default
 * @see LimitedDeepPartial - Type used for the partial object parameter
 */
export declare const object_factory_maker: <T extends {}>(default_obj: T, factory_updates?: ((obj: T) => T) | undefined) => ((obj?: LimitedDeepPartial<T>) => T);

export declare type OutputRendererProps = {};

export declare type OutputRendererType = BasicOutputRendererType | React.MemoExoticComponent<BasicOutputRendererType>;

declare interface PackedPlugin {
    module: string;
    js?: string[];
    css?: string[];
}

declare type PartialSerializedIOType = LimitedDeepPartial<SerializedIOType>;

export declare type PartialSerializedNodeType = LimitedDeepPartial<SerializedNodeType>;

declare class PluginManagerHandler extends AbstractFuncNodesReactFlowHandleHandler implements PluginManagerManagerAPI {
    plugins: UseBoundStore<StoreApi<{
        [key: string]: FuncNodesReactPlugin | undefined;
    }>>;
    render_options: UseBoundStore<StoreApi<RenderOptions>>;
    constructor(context: FuncNodesReactFlowHandlerContext);
    add_plugin(name: string, plugin: VersionedFuncNodesReactPlugin): void;
    update_render_options(options: RenderOptions): void;
    add_packed_plugin(name: string, plugin: PackedPlugin): Promise<void>;
}

declare interface PluginManagerManagerAPI {
    plugins: UseBoundStore<StoreApi<{
        [key: string]: FuncNodesReactPlugin | undefined;
    }>>;
    add_plugin: (name: string, plugin: FuncNodesReactPlugin) => void;
    add_packed_plugin: (name: string, plugin: PackedPlugin) => void;
    render_options: UseBoundStore<StoreApi<RenderOptions>>;
    update_render_options: (options: RenderOptions) => void;
}

declare interface PongMessage {
    type: "pong";
}

/**
 * A helper type array used to track and control recursion depth in type operations.
 *
 * This type provides a lookup table for decremental recursion depth values, where each
 * index maps to the previous number in the sequence. This is used by LimitedDeepPartial
 * and other recursive type operations to prevent infinite recursion by counting down
 * from a maximum depth to zero.
 *
 * @example
 * ```typescript
 * // Usage in recursive type (internal to LimitedDeepPartial)
 * type DecrementDepth<D extends number> = Prev[D]; // Prev[5] = 4, Prev[4] = 3, etc.
 * ```
 *
 * @note The array contains values from 'never' at index 0 to 99 at index 100.
 *       Index 0 maps to 'never' which effectively terminates recursion.
 *       Indexes 1-100 map to their predecessor (1→0, 2→1, 3→2, etc.).
 *
 * @see LimitedDeepPartial - Primary consumer of this type for depth-limited recursion
 */
declare type Prev = [
never,
0,
1,
2,
3,
4,
5,
6,
7,
8,
9,
10,
11,
12,
13,
14,
15,
16,
17,
18,
19,
20,
21,
22,
23,
24,
25,
26,
27,
28,
29,
30,
31,
32,
33,
34,
35,
36,
37,
38,
39,
40,
41,
42,
43,
44,
45,
46,
47,
48,
49,
50,
51,
52,
53,
54,
55,
56,
57,
58,
59,
60,
61,
62,
63,
64,
65,
66,
67,
68,
69,
70,
71,
72,
73,
74,
75,
76,
77,
78,
79,
80,
81,
82,
83,
84,
85,
86,
87,
88,
89,
90,
91,
92,
93,
94,
95,
96,
97,
98,
99
];

declare interface ProgressState {
    message: string;
    status: string;
    progress: number;
    blocking: boolean;
}

declare interface ProgressStateMessage extends ProgressState {
    type: "progress";
}

declare interface ReactFlowLayerProps {
    minimap: boolean;
    static: boolean;
    minZoom: number;
    maxZoom: number;
    allowFullScreen: boolean;
    allowExpand: boolean;
    showNodeSettings: boolean;
}

declare interface ReactFlowLibraryProps {
    show: boolean;
}

declare class ReactFlowManagerHandler extends AbstractFuncNodesReactFlowHandleHandler implements ReactFlowManagerManagerAPI {
    useReactFlowStore: RFStore;
    rf_instance?: ReactFlowInstance<Node_2, Edge> | undefined;
    constructor(context: FuncNodesReactFlowHandlerContext);
    on_rf_node_change: (nodechange: NodeChange[]) => void;
    on_rf_edge_change: (_edgechange: EdgeChange[]) => void;
    on_connect: (connection: Connection) => void;
}

declare interface ReactFlowManagerManagerAPI {
    useReactFlowStore: RFStore;
    rf_instance?: ReactFlowInstance<Node_2, Edge> | undefined;
}

export declare interface RendererPlugin {
    input_renderers?: {
        [key: string]: InputRendererType | undefined;
    };
    output_renderers?: {
        [key: string]: OutputRendererType | undefined;
    };
    handle_preview_renderers?: {
        [key: string]: HandlePreviewRendererType | undefined;
    };
    data_overlay_renderers?: {
        [key: string]: DataOverlayRendererType | undefined;
    };
    data_preview_renderers?: {
        [key: string]: DataPreviewViewRendererType | undefined;
    };
    data_view_renderers?: {
        [key: string]: DataViewRendererType | undefined;
    };
    node_renderers?: {
        [key: string]: NodeRendererType | undefined;
    };
    node_hooks?: {
        [key: string]: NodeHooksType[] | undefined;
    };
}

declare interface RenderOptions {
    typemap?: {
        [key: string]: string | undefined;
    };
    inputconverter?: {
        [key: string]: string | undefined;
    };
}

export declare type RenderPluginFactoryProps = {};

declare type RenderType = "string" | "number" | "boolean" | "image" | "any" | SerializedType;

declare interface ResultMessage {
    type: "result";
    id?: string;
    result: any;
}

declare type RFState = {
    _nodes: Node_2[];
    _edges: Edge[];
    _nodes_map: Map<string, Node_2>;
    update_nodes: (nodes: Node_2[]) => void;
    partial_update_nodes: (nodes: Node_2[]) => void;
    update_edges: (edges: Edge[]) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    getNode: (id: string) => Node_2 | undefined;
    getNodes: () => Node_2[];
    getEdges: () => Edge[];
};

declare type RFStore = UseBoundStore<StoreApi<RFState>>;

declare type SchemaResponse = {
    jsonSchema: RJSFSchema;
    uiSchema?: UiSchema;
    formData?: any;
};

declare interface SerializedIOType extends BasicIOType {
    value: IOValueType;
    fullvalue: IOValueType;
}

declare type SerializedNodeIOMappingType = {
    [key: string]: SerializedIOType | undefined;
};

export declare interface SerializedNodeType extends BasicNodeType {
    in_trigger: boolean;
    io: SerializedNodeIOMappingType | SerializedIOType[];
    io_order?: string[];
    progress: DeepPartial<TqdmState>;
}

declare type SerializedType = string | AllOf | AnyOf | ArrayOf | DictOf | EnumOf | TypeOf;

declare interface Shelf {
    name: string;
    description?: string;
    nodes: LibNode[];
    subshelves: Shelf[];
}

declare class StateManagerHandler extends AbstractFuncNodesReactFlowHandleHandler implements StateManagerManagerAPI {
    progress_state: UseBoundStore<StoreApi<ProgressState>>;
    local_settings: UseBoundStore<StoreApi<FuncnodesReactFlowLocalSettings>>;
    local_state: UseBoundStore<StoreApi<FuncnodesReactFlowLocalState>>;
    toaster?: ToastDispatcher;
    constructor(context: FuncNodesReactFlowHandlerContext);
    set_progress(progress: ProgressState): void;
    auto_progress(): void;
    update_view_settings(settings: FuncnodesReactFlowViewSettings): void;
}

declare interface StateManagerManagerAPI {
    set_progress: (progress: ProgressState) => void;
    auto_progress: () => void;
    toast?: ToastDispatcher;
}

export declare class TextStructure extends DataStructure<ArrayBuffer, string> {
    private _value;
    constructor({ data, mime }: {
        data: BinarySource;
        mime: string;
    });
    get value(): string;
    toString(): string;
}

declare type ToastDispatcher = {
    (payload: ToastPayload): void;
    success: (payload: ToastPayload) => void;
    error: (payload: ToastPayload) => void;
};

declare interface ToastPayload {
    title?: string;
    description: string;
    status?: ToastStatus;
    type?: ToastType;
    duration?: number;
    action?: {
        label: string;
        altText: string;
        onClick: () => void;
    };
}

declare type ToastStatus = 'default' | 'success' | 'error';

declare type ToastType = 'foreground' | 'background';

/**
 * Interface representing the state of a tqdm progress bar.
 *
 * Notes on each field:
 * - `n`: Current iteration count.
 * - `total`: Total number of iterations if known, `null` otherwise.
 * - `elapsed`: Time elapsed in seconds since the start of iteration.
 * - `ncols`: Number of columns for the progress bar. If `null`, not dynamically determined.
 * - `nrows`: Number of rows. Usually `null` as `tqdm` typically focuses on columns.
 * - `prefix`: Description string provided to `tqdm` via `desc`.
 * - `ascii`: Whether to use ASCII characters for the bar or a custom set of ASCII characters.
 *            Can be `true`, `false`, or a string specifying the characters.
 * - `unit`: Iteration unit (e.g., 'it', 'steps', 'items').
 * - `unit_scale`: If `true`, `tqdm` scales the iteration values.
 *                If a number, `tqdm` uses it as a scaling factor.
 * - `rate`: Current rate of iteration (iterations/second). `null` if rate cannot be computed.
 * - `bar_format`: Custom format string for the bar. If `null`, the default format is used.
 * - `postfix`: Additional data appended to the bar. Could be a string or an object passed via `set_postfix()`.
 * - `unit_divisor`: Divisor used when scaling units (e.g., 1000 or 1024).
 * - `initial`: Initial counter value if specified, else `null`.
 * - `colour`: Colour for the progress bar if supported, else `null`.
 */
declare interface TqdmState {
    n: number;
    total?: number;
    elapsed: number;
    ncols?: number;
    nrows?: number;
    prefix?: string;
    ascii: boolean | string;
    unit: string;
    unit_scale: boolean | number;
    rate?: number;
    bar_format?: string;
    postfix?: string | Record<string, unknown>;
    unit_divisor: number;
    initial?: number;
    colour?: string;
}

declare interface TypeOf {
    type: "type";
    value: SerializedType;
}

declare interface UpdateableIOOptions {
    name?: string;
    hidden?: boolean;
}

export declare const useFuncNodesContext: () => FuncNodesReactFlow;

export declare function useIOGetFullValue(): IOGetFullValue | undefined;

export declare function useIOGetFullValue(io: string): IOGetFullValue | undefined;

export declare function useIOGetFullValue(io: string | undefined): IOGetFullValue | undefined;

export declare function useIOStore(): IOStore;

export declare function useIOStore(io: string): IOStore | undefined;

export declare function useIOStore(io: string | undefined): IOStore | undefined;

export declare function useIOValueStore(): ValueStoreInterface;

export declare function useIOValueStore(io: string): ValueStoreInterface | undefined;

export declare function useIOValueStore(io: string | undefined): ValueStoreInterface | undefined;

declare type UseJSONStore<T extends JSONObject> = UseBoundStore<StoreApi<T>>;

export declare const useNodeStore: () => NodeStore;

export declare function useSetIOValue(): (value: any, set_default?: boolean) => void;

export declare function useSetIOValue(io: string): (value: any, set_default?: boolean) => void;

export declare function useSetIOValue(io: IOType): (value: any, set_default?: boolean) => void;

export declare function useSetIOValueOptions(): IOValueOptionsSetter;

export declare function useSetIOValueOptions(io: string): IOValueOptionsSetter;

export declare function useSetIOValueOptions(io: IOType): IOValueOptionsSetter;

export declare const useWorkerApi: () => {
    node: WorkerNodeManagerAPI | undefined;
    group: WorkerGroupManagerAPI | undefined;
    edge: WorkerEdgeManagerAPI | undefined;
    hooks: WorkerHookManagerAPI | undefined;
    lib: WorkerLibraryManagerAPI | undefined;
    worker: FuncNodesWorker | undefined;
};

declare interface ValueStoreInterface {
    preview: DataStructure<AnyDataType, JSONType | undefined> | undefined;
    full: DataStructure<AnyDataType, JSONType | undefined> | undefined;
}

export declare interface VersionedFuncNodesReactPlugin<V extends string = string> {
    renderpluginfactory?: (props: RenderPluginFactoryProps) => RendererPlugin;
    v: V;
}

declare type WorkerAPI = {
    node: WorkerNodeManagerAPI;
    group: WorkerGroupManagerAPI;
    edge: WorkerEdgeManagerAPI;
    hooks: WorkerHookManagerAPI;
    lib: WorkerLibraryManagerAPI;
};

declare class WorkerCommunicationManager extends AbstractWorkerHandler {
    private CHUNK_TIMEOUT;
    private _unique_cmd_outs;
    private messagePromises;
    private _chunk_cleanup_timer;
    private blobChunks;
    constructor(context: WorkerHandlerContext);
    private cleanupChunks;
    start(): void;
    stop(): void;
    send(data: any): void;
    _send_cmd({ cmd, kwargs, as_bytes, wait_for_response, response_timeout, retries, unique, }: {
        cmd: string;
        kwargs?: any;
        wait_for_response?: boolean;
        response_timeout?: number;
        as_bytes?: boolean;
        retries?: number;
        unique?: boolean;
    }): Promise<any>;
    receive(data: JSONMessage): Promise<any>;
    receive_bytes(headerObj: {
        [key: string]: string | undefined;
    }, bytes: Uint8Array): Promise<void>;
    onbytes(data: Uint8Array): Promise<void>;
}

declare class WorkerConnectionHealthManager extends AbstractWorkerHandler {
    private _responsive;
    private _last_pong;
    private pingInterval;
    private responsivenessCheckInterval;
    constructor(context: WorkerHandlerContext);
    start(): void;
    stop(): void;
    receivePong(): void;
    isResponsive(): boolean;
}

declare class WorkerEdgeManager extends AbstractWorkerHandler implements WorkerEdgeManagerAPI {
    start(): void;
    stop(): void;
    add_edge({ src_nid, src_ioid, trg_nid, trg_ioid, replace, }: {
        src_nid: string;
        src_ioid: string;
        trg_nid: string;
        trg_ioid: string;
        replace?: boolean;
    }): Promise<any>;
    remove_edge({ src_nid, src_ioid, trg_nid, trg_ioid, }: {
        src_nid: string;
        src_ioid: string;
        trg_nid: string;
        trg_ioid: string;
    }): Promise<any>;
}

declare interface WorkerEdgeManagerAPI {
    add_edge: (params: {
        src_nid: string;
        src_ioid: string;
        trg_nid: string;
        trg_ioid: string;
        replace?: boolean;
    }) => any;
    remove_edge: (params: {
        src_nid: string;
        src_ioid: string;
        trg_nid: string;
        trg_ioid: string;
    }) => any;
}

declare interface WorkerEvent {
    type: "workerevent";
    event: string;
    data: {
        [key: string]: any | undefined;
    };
}

declare class WorkerEventManager extends AbstractWorkerHandler {
    private _ns_event_intercepts;
    start(): void;
    stop(): void;
    _receive_edge_added(src_nid: string, src_ioid: string, trg_nid: string, trg_ioid: string): Promise<void>;
    _receive_groups(groups: NodeGroups): Promise<void>;
    _receive_node_added(data: SerializedNodeType): Promise<NodeType | undefined>;
    receive_workerevent({ event, data }: WorkerEvent): Promise<void>;
    intercept_ns_event(event: NodeSpaceEvent): Promise<NodeSpaceEvent>;
    receive_nodespace_event(ns_event: NodeSpaceEvent): Promise<void | NodeType>;
    add_ns_event_intercept(hook: string, callback: (event: NodeSpaceEvent) => Promise<NodeSpaceEvent>): () => void;
}

declare class WorkerGroupManager extends AbstractWorkerHandler implements WorkerGroupManagerAPI {
    start(): void;
    stop(): void;
    group_nodes(nodeIds: string[], group_ids: string[]): Promise<NodeGroups>;
    remove_group(gid: string): Promise<void>;
    locally_update_group(action: GroupActionUpdate): void;
}

declare interface WorkerGroupManagerAPI {
    group_nodes: (nodeIds: string[], group_ids: string[]) => Promise<NodeGroups>;
    remove_group: (gid: string) => Promise<void>;
    locally_update_group: (action: GroupActionUpdate) => void;
}

/**
 * Defines the required context for handler classes, providing access
 * to the parent worker instance.
 */
declare interface WorkerHandlerContext {
    worker: FuncNodesWorker;
}

declare class WorkerHookManager extends AbstractWorkerHandler implements WorkerHookManagerAPI {
    _hooks: Map<string, ((p: WorkerHookProperties) => Promise<void>)[]>;
    start(): void;
    stop(): void;
    add_hook(hook: string, callback: (p: WorkerHookProperties) => Promise<void>): () => void;
    call_hooks(hook: string, data?: any): Promise<void>;
}

declare interface WorkerHookManagerAPI {
    add_hook: (hook: string, callback: (p: WorkerHookProperties) => Promise<void>) => () => void;
    call_hooks: (hook: string, data?: any) => Promise<void>;
}

declare interface WorkerHookProperties {
    worker: FuncNodesWorker;
    data: any;
}

declare class WorkerLibraryManager extends AbstractWorkerHandler implements WorkerLibraryManagerAPI {
    private _available_modules_cache;
    start(): void;
    stop(): void;
    add_external_worker({ module, cls_module, cls_name, }: {
        module: string;
        cls_module: string;
        cls_name: string;
    }): Promise<any>;
    add_lib(lib: string, release: string): Promise<any>;
    remove_lib(lib: string): Promise<any>;
    get_available_modules({ wait_for_response, on_load, }: {
        wait_for_response?: boolean;
        on_load?: (modules: GroupedAvailableModules) => void;
    }): Promise<GroupedAvailableModules>;
    remove_external_worker(worker_id: string, class_id: string): Promise<any>;
    get_external_worker_config(worker_id: string, class_id: string): Promise<SchemaResponse>;
}

declare interface WorkerLibraryManagerAPI {
    add_external_worker: (params: {
        module: string;
        cls_module: string;
        cls_name: string;
    }) => Promise<void>;
    add_lib: (lib: string, release: string) => Promise<void>;
    remove_lib: (lib: string) => Promise<void>;
    get_available_modules: (args: {
        wait_for_response?: boolean;
        on_load?: (modules: GroupedAvailableModules) => void;
    }) => Promise<GroupedAvailableModules>;
    remove_external_worker: (worker_id: string, class_id: string) => Promise<void>;
    get_external_worker_config: (worker_id: string, class_id: string) => Promise<SchemaResponse>;
}

declare class WorkerManager {
    private _wsuri;
    private workers;
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private initialTimeout;
    private maxTimeout;
    private zustand;
    private connectionTimeout?;
    on_setWorker: (worker: FuncNodesWorker | undefined) => void;
    constructor(wsuri: string, zustand: FuncNodesReactFlow);
    get wsuri(): string;
    get open(): boolean;
    private connect;
    on_ws_error(): void;
    onopen(): void;
    onmessage(event: string): void;
    setWorker(worker: FuncNodesWorker | undefined): void;
    restart_worker(workerid: string): Promise<void>;
    private calculateReconnectTimeout;
    private reconnect;
    onclose(): void;
    set_active(workerid: string): void;
    new_worker({ name, reference, copyLib, copyNS, in_venv, }: {
        name?: string;
        reference?: string;
        copyLib?: boolean;
        copyNS?: boolean;
        in_venv?: boolean;
    }): void;
    remove(): void;
}

declare class WorkerManagerHandler extends AbstractFuncNodesReactFlowHandleHandler implements WorkerManagerManagerAPI {
    worker: FuncNodesWorker | undefined;
    workermanager: WorkerManager | undefined;
    workers: UseBoundStore<StoreApi<WorkersState>>;
    workerstate: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
    _unsubscribeFromWorker: (() => void) | undefined;
    constructor(context: FuncNodesReactFlowHandlerContext);
    set_worker(worker: FuncNodesWorker | undefined): void;
}

declare interface WorkerManagerManagerAPI {
    set_worker: (worker: FuncNodesWorker | undefined) => void;
}

declare class WorkerNodeManager extends AbstractWorkerHandler implements WorkerNodeManagerAPI {
    start(): void;
    stop(): void;
    trigger_node(node_id: string): Promise<void>;
    add_node(node_id: string): Promise<NodeType | undefined>;
    remove_node(node_id: string): Promise<void>;
    locally_update_node(action: NodeActionUpdate): void;
    set_io_value({ nid, ioid, value, set_default, }: {
        nid: string;
        ioid: string;
        value: any;
        set_default: boolean;
    }): Promise<any>;
    set_io_value_options({ nid, ioid, values, keys, nullable, }: {
        nid: string;
        ioid: string;
        values: any[];
        keys: string[];
        nullable: boolean;
    }): Promise<any>;
    get_io_value({ nid, ioid }: {
        nid: string;
        ioid: string;
    }): Promise<any>;
    get_ios_values({ nid }: {
        nid: string;
    }): Promise<{
        [ioid: string]: any;
    }>;
    get_io_full_value({ nid, ioid }: {
        nid: string;
        ioid: string;
    }): Promise<DataStructure<any, JSONType | undefined>>;
    update_io_options({ nid, ioid, options, }: {
        nid: string;
        ioid: string;
        options: UpdateableIOOptions;
    }): Promise<any>;
    get_node_status(nid: string): Promise<any>;
    get_remote_node_state(nid: string): Promise<void>;
}

declare interface WorkerNodeManagerAPI {
    set_io_value: (params: {
        nid: string;
        ioid: string;
        value: any;
        set_default: boolean;
    }) => any;
    set_io_value_options: (params: {
        nid: string;
        ioid: string;
        values: any[];
        keys: string[];
        nullable: boolean;
    }) => Promise<void>;
    get_io_full_value: (params: {
        nid: string;
        ioid: string;
    }) => Promise<any>;
    get_io_value: (params: {
        nid: string;
        ioid: string;
    }) => Promise<any>;
    get_ios_values: (params: {
        nid: string;
    }) => any;
    get_node_status: (nid: string) => any;
    update_io_options: (params: {
        nid: string;
        ioid: string;
        options: UpdateableIOOptions;
    }) => any;
    add_node: (node_id: string) => Promise<NodeType | undefined>;
    remove_node: (node_id: string) => Promise<void>;
    trigger_node: (node_id: string) => Promise<void>;
    locally_update_node: (action: NodeActionUpdate) => void;
    get_remote_node_state: (nid: string) => Promise<void>;
}

export declare interface WorkerProps {
    zustand?: FuncNodesReactFlow;
    uuid: string;
    on_error?: (error: string | Error) => void;
    on_sync_complete?: (worker: FuncNodesWorker) => Promise<void>;
}

declare interface WorkerRepresentation {
    uuid: string;
    host: string;
    port: number;
    ssl: boolean;
    active: boolean;
    open: boolean;
    name: string | null;
}

declare interface WorkersState {
    [key: string]: WorkerRepresentation | undefined;
}

declare class WorkerSyncManager extends AbstractWorkerHandler {
    on_sync_complete: (worker: FuncNodesWorker) => Promise<void>;
    _nodeupdatetimer: ReturnType<typeof setTimeout> | undefined;
    _local_nodeupdates: Map<string, PartialSerializedNodeType>;
    _local_groupupdates: Map<string, Partial<NodeGroup>>;
    _groupupdatetimer: ReturnType<typeof setTimeout> | undefined;
    _after_next_sync: ((worker: FuncNodesWorker) => Promise<void>)[];
    constructor(context: WorkerSyncManagerContext);
    start(): void;
    stop(): void;
    stepwise_fullsync(): Promise<void>;
    add_after_next_sync(callback: (worker: FuncNodesWorker) => Promise<void>): void;
    remove_after_next_sync(callback: (worker: FuncNodesWorker) => Promise<void>): void;
    sync_lib(): Promise<void>;
    sync_external_worker(): Promise<void>;
    sync_funcnodes_plugins(): Promise<void>;
    sync_view_state(): Promise<void>;
    sync_nodespace(): Promise<void>;
    fullsync(): Promise<void>;
    sync_local_node_updates(): void;
    sync_local_group_updates(): void;
    locally_update_node(action: NodeActionUpdate): void;
    locally_update_group(action: GroupActionUpdate): void;
}

declare interface WorkerSyncManagerContext extends WorkerHandlerContext {
    on_sync_complete: ((worker: FuncNodesWorker) => Promise<void>) | undefined;
}

export { }
