import { useIOStore } from "@/nodes";
import { getBase64ByteLength } from "@/data-helpers";
import type { InLineRendererType } from "./types";

export const Base64BytesInLineRenderer: InLineRendererType = () => {
  const iostore = useIOStore();
  const { full, preview } = iostore.valuestore();
  const source = full?.value ?? preview?.value;
  const length = getBase64ByteLength(source);
  return `Bytes(${length})`;
};
