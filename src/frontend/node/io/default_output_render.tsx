import { useContext } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../../state";
import { FuncNodesContext } from "../../funcnodesreactflow";
import { SortableTable } from "../../utils/table";

const SingleValueOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  let value = io.value;
  if (value === undefined) {
    value = "";
  } else {
    value = JSON.stringify(io.value).replace(/\\n/g, "\n"); //respect "\n" in strings
  }

  return (
    <div>
      <pre>{value}</pre>
    </div>
  );
};

const InLineOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  let value = io.value;
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

const TableOutput = ({ io }: { io: IOType }) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  let value = io.value;
  if (value === undefined) {
    value = [];
  }

  return <SortableTable tabledata={value} />;
};
export { SingleValueOutput, InLineOutput, TableOutput };
