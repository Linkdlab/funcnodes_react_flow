import { IOStore } from "../../../states/nodeio.t";
import * as React from "react";
import { useContext } from "react";
import { RenderMappingContext } from "../../datarenderer/rendermappings";

const InLineOutput = ({
  iostore,
  typestring,
}: {
  iostore: IOStore;
  typestring: string | undefined;
}) => {
  const { InLineRenderer } = useContext(RenderMappingContext);

  const { preview, full } = iostore.valuestore();

  if (typestring && InLineRenderer[typestring]) {
    return <div>{InLineRenderer[typestring]({ iostore })}</div>;
  }

  let disp = (JSON.stringify(full || preview) || "").replace(/\\n/g, "\n");

  //truncate the string if it is too long
  if (disp.length > 63) {
    disp = disp.slice(0, 60) + "...";
  }

  return <div>{disp}</div>;
};

export { InLineOutput };
