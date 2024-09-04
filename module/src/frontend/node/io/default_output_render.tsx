import { IOType } from "../../../states/nodeio.t";
import React, { useContext } from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";

const InLineOutput = ({
  io,
  typestring,
}: {
  io: IOType;
  typestring: string | undefined;
}) => {
  const { InLineRenderer } = useContext(RenderMappingContext);

  if (typestring && InLineRenderer[typestring]) {
    return <div>{InLineRenderer[typestring]({ io })}</div>;
  }

  let value = io.fullvalue;
  if (value == undefined) value = io.value;
  if (value === undefined) {
    value = "";
  } else {
    value = JSON.stringify(value).replace(/\\n/g, "\n"); //respect "\n" in strings
  }
  //truncate the string if it is too long
  if (value.length > 63) {
    value = value.slice(0, 60) + "...";
  }

  return <div>{value}</div>;
};

export { InLineOutput };
