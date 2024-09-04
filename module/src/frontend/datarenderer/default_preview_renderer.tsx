import React from "react";
import { IOType } from "../../states/nodeio.t";
import JSONDataDisplay from "../utils/jsondata";
import { SortableTable } from "../utils/table";
import { Base64ImageRenderer, SVGImageRenderer } from "./images";

const Base64ImageOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  }

  return <Base64ImageRenderer value={value} />;
};

const SVGImageOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  }

  return <SVGImageRenderer value={value} />;
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

const Base64BytesInLineOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  } else {
    value = JSON.stringify(io.value).replace(/\\n/g, "\n"); //respect "\n" in strings
  }
  const length = Math.round((3 * value.length) / 4); // 3/4 is the ratio of base64 encoding
  return `Bytes(${length})`;
};

const Base64BytesOutput = ({ io }: { io: IOType }) => {
  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  }

  // chack if the value is a base64 string
  if (typeof value !== "string" || value.length % 4 !== 0)
    return <div>{value}</div>;

  const length = Math.round((3 * value.length) / 4); // 3/4 is the ratio of base64 encoding
  return (
    <div>
      <pre>Bytes({length})</pre>
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

export {
  Base64ImageOutput,
  SingleValueOutput,
  TableOutput,
  DictOutput,
  SVGImageOutput,
  Base64BytesOutput,
  Base64BytesInLineOutput,
};
