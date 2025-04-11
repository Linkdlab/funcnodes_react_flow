declare global {
  interface Window {
    FuncNodes: any;
  }
}
import * as React from "react";
import { FuncNodes, FuncnodesReactFlowProps } from "./index";
import { createRoot } from "react-dom/client";
import "./index.scss";

declare const __FN_VERSION__: string;

const FuncNodesRenderer = (
  id_or_element: string | HTMLElement,
  options?: Partial<FuncnodesReactFlowProps>
) => {
  if (options === undefined) {
    options = {};
  }

  const { element, eleid } =
    typeof id_or_element === "string"
      ? {
          element: document.getElementById(id_or_element) as HTMLElement,
          eleid: id_or_element,
        }
      : { element: id_or_element, eleid: id_or_element.id };

  createRoot(element).render(
    <React.StrictMode>
      <FuncNodes {...options} id={options.id || eleid} />
    </React.StrictMode>
  );
};

window.FuncNodes = FuncNodesRenderer;
window.FuncNodes.version = __FN_VERSION__;
export default FuncNodesRenderer;
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
