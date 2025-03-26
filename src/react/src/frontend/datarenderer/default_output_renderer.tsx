import * as React from "react";
import { latest } from "../../types/versioned/versions.t";
import { RenderMappingContext } from "./rendermappings";
export const InLineOutput = ({
  iostore,
  typestring,
}: {
  iostore: latest.IOStore;
  typestring: string | undefined;
}) => {
  const { InLineRenderer } = React.useContext(RenderMappingContext);

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

export const DefaultOutputrenderer: {
  [key: string]: latest.OutputRendererType | undefined;
} = {};
