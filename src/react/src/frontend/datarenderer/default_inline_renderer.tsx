import { latest } from "@/barrel_imports";

export const Base64BytesInLineRenderer: latest.InLineRendererType = ({
  iostore,
}: {
  iostore: latest.IOStore;
}) => {
  const { full, preview } = iostore.valuestore();
  const disp = JSON.stringify(full?.value || preview?.value) || "";

  const length = Math.round((3 * disp.length) / 4); // 3/4 is the ratio of base64 encoding
  return `Bytes(${length})`;
};

export const DefaultInLineRenderer: {
  [key: string]: latest.InLineRendererType | undefined;
} = {
  bytes: Base64BytesInLineRenderer,
};
