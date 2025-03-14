import * as React from "react";
import { IOStore } from "../../states/nodeio.t";
import JSONDataDisplay from "../utils/jsondata";
import { SortableTable } from "../utils/table";
import { Base64ImageRenderer, SVGImageRenderer } from "./images";

const Base64ImageOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();
  const disp = full || preview || "";

  return <Base64ImageRenderer value={disp} />;
};

const SVGImageOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();
  const disp = full || preview || "";

  return <SVGImageRenderer value={disp} />;
};

const SingleValueOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();
  const disp = JSON.stringify(full || preview) || "";

  return (
    <div>
      <pre>{disp}</pre>
    </div>
  );
};

const Base64BytesInLineOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();
  const disp = JSON.stringify(full || preview) || "";

  const length = Math.round((3 * disp.length) / 4); // 3/4 is the ratio of base64 encoding
  return `Bytes(${length})`;
};

const Base64BytesOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();
  const disp = full || preview || "";

  // chack if the value is a base64 string
  if (typeof disp !== "string" || disp.length % 4 !== 0)
    return <div>{disp}</div>;

  const length = Math.round((3 * disp.length) / 4); // 3/4 is the ratio of base64 encoding
  return (
    <div>
      <pre>Bytes({length})</pre>
    </div>
  );
};

const TableOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();

  return <SortableTable tabledata={full || preview || "{}"} />;
};

const DictOutput = ({ iostore }: { iostore: IOStore }) => {
  const { full, preview } = iostore.valuestore();

  return <JSONDataDisplay data={full || preview || "{}"} />;
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
