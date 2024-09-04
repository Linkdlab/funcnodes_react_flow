import React from "react";
import FuncnodesReactFlow from "@linkdlab/funcnodes_react_flow";

import "@linkdlab/funcnodes_react_flow/../../css/style.css";

const App = () => {
  return (
    <div
      className="App"
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <FuncnodesReactFlow></FuncnodesReactFlow>
    </div>
  );
};

export default App;
