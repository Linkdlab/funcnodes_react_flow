import { InLineRendererType } from "./types";
import { Base64BytesInLineRenderer } from "./bytes";

export const DefaultInLineRenderer: {
  [key: string]: InLineRendererType | undefined;
} = {
  bytes: Base64BytesInLineRenderer,
};
