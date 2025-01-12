import "./index.css";
import "@linkdlab/funcnodes_react_flow/../../css/style.css";
import { FuncNodes } from "@linkdlab/funcnodes_react_flow";

import reportWebVitals from "./reportWebVitals";

// @ts-ignore
window.FuncNodes = FuncNodes

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals(console.log);
