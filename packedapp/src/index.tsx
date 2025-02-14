declare global {
  interface Window {
    FuncNodes: any;
  }
}
import "./index.css";
import "@linkdlab/funcnodes_react_flow/dist/css/style.css";
import { FuncNodes, FuncNodesAppOptions } from "@linkdlab/funcnodes_react_flow";

import reportWebVitals from "./reportWebVitals";
import React from "react";
import { createRoot } from "react-dom/client";
import { v4 as uuidv4 } from "uuid";

const FuncNodesRenderer = (
  id_or_element: string | HTMLElement,
  options?: Partial<FuncNodesAppOptions>
) => {
  let eleid: string | undefined;
  let element: HTMLElement;

  if (options === undefined) {
    options = {};
  }

  if (typeof id_or_element === "string") {
    eleid = id_or_element;
    element = document.getElementById(eleid) as HTMLElement;
  } else {
    element = id_or_element;
    eleid = element.id;
  }

  const isid = options.id || eleid || uuidv4();

  const fulloptions: FuncNodesAppOptions = { ...options, id: isid };

  createRoot(element).render(
    <React.StrictMode>
      <FuncNodes {...fulloptions} />
    </React.StrictMode>
  );
};

window.FuncNodes = FuncNodesRenderer;
export default FuncNodesRenderer;
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals(console.log);
