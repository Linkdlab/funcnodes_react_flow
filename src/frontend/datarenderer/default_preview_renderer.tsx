import React from "react";
import { IOType } from "../../states/nodeio.t";
import JSONDataDisplay from "../utils/jsondata";
import { SortableTable } from "../utils/table";
import { Base64ImageRenderer } from "./images";

const Base64ImageOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  }

  return <Base64ImageRenderer value={value} />;
};

const SingleValueOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
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

const TableOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = [];
  }

  return <SortableTable tabledata={value} />;
};

const DictOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;

  if (value === undefined) value = io.value;
  if (value === undefined) {
    value = {};
  }

  return <JSONDataDisplay data={value} />;
};

export { Base64ImageOutput, SingleValueOutput, TableOutput, DictOutput };
