import { useIOStore } from "@/nodes";
import { InLineRendererType } from "./types";

export const Base64BytesInLineRenderer: InLineRendererType = () => {
  const iostore = useIOStore();
  const { full, preview } = iostore.valuestore();
  const disp = JSON.stringify(full?.value || preview?.value) || "";

  const length = Math.round((3 * disp.length) / 4); // 3/4 is the ratio of base64 encoding
  return `Bytes(${length})`;
};
