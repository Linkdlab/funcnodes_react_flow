declare global {
    interface Window {
        FuncNodes: any;
    }
}
import "./index.css";
import "@linkdlab/funcnodes_react_flow/dist/css/style.css";
import { FuncNodesAppOptions } from "@linkdlab/funcnodes_react_flow";
declare const FuncNodesRenderer: (id_or_element: string | HTMLElement, options?: Partial<FuncNodesAppOptions>) => void;
export default FuncNodesRenderer;
//# sourceMappingURL=index.d.ts.map
