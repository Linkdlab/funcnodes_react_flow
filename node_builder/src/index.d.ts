declare global {
    interface Window {
        loadPyodide?: () => Promise<any>;
        ace?: any;
    }
}
import { PartialNodeType } from "@linkdlab/funcnodes_react_flow";
import "reactflow/dist/style.css";
import "@linkdlab/funcnodes_react_flow/../../css/style.css";
interface NodeBuilderOptions {
    ser_node?: PartialNodeType;
    python_code?: string;
    show_python_editor: boolean;
    show_ser_node_editor: boolean;
    pyiodide?: any;
    nodeview: {
        height: string;
        width: string;
    };
    editorview: {
        width: string;
    };
}
declare const NodeBuilder: (element: HTMLElement, options?: NodeBuilderOptions) => void;
export default NodeBuilder;
//# sourceMappingURL=index.d.ts.map
