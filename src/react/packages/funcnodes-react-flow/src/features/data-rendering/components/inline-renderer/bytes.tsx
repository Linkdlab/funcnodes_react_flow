import { InLineRendererType } from "./types";
import { IOStore } from "@/nodes-core";

export const Base64BytesInLineRenderer: InLineRendererType = ({
  iostore,
}: {
  iostore: IOStore;
}) => {
  const { full, preview } = iostore.valuestore();
  const disp = JSON.stringify(full?.value || preview?.value) || "";

  const length = Math.round((3 * disp.length) / 4); // 3/4 is the ratio of base64 encoding
  return `Bytes(${length})`;
};
