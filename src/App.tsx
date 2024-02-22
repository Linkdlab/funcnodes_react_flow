import React from "react";
import "./App.css";
import "reactflow/dist/style.css";
import FuncnodesReactFlow from "./frontend";

function App() {
  return (
    <div
      className="App"
      style={{
        height: "98vh",
        width: "98vw",
        marginLeft: "1vw",
        marginTop: "1vh",
      }}
    >
      <FuncnodesReactFlow></FuncnodesReactFlow>
    </div>
  );
}

export default App;
