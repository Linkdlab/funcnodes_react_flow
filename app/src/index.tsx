import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import reportWebVitals from "./reportWebVitals";
import App from "./App";

// @ts-ignore
window.AppReact = React;

const FuncNodes = (id_or_element: string | HTMLElement) => {
  let id: string;
  let element: HTMLElement;
  if (typeof id_or_element === "string") {
    id = id_or_element;
    element = document.getElementById(id) as HTMLElement;
  } else {
    element = id_or_element;
    id = element.id;
  }

  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <App id={id} />
    </React.StrictMode>
  );
};

FuncNodes("root");

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals(console.log);
