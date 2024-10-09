import React from "react";
import FuncnodesReactFlow from "@linkdlab/funcnodes_react_flow";

import "@linkdlab/funcnodes_react_flow/../../css/style.css";

const App = ({ id }: { id?: string }) => {
  return (
    <div
      className="App"
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <FuncnodesReactFlow id={id}></FuncnodesReactFlow>
    </div>
  );
};

export default App;
