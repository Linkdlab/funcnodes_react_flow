import { useContext } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../../states/fnrfzst.t";
import { FuncNodesContext } from "../../funcnodesreactflow";
import { IOType } from "../../../states/nodeio.t";
import React from "react";

const InLineOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  } else {
    value = JSON.stringify(io.value).replace(/\\n/g, "\n"); //respect "\n" in strings
  }
  //truncate the string if it is too long
  if (value.length > 63) {
    value = value.slice(0, 60) + "...";
  }

  return <div>{value}</div>;
};

export { InLineOutput };
