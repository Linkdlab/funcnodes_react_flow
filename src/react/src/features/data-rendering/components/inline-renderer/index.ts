import { latest } from "@/barrel_imports";

export interface InLineRendererProps {
  iostore: latest.IOStore;
}
export type InLineRendererType = ({ iostore }: InLineRendererProps) => string;
export { Base64BytesInLineRenderer } from "./bytes";
export { DefaultInLineRenderer } from "./default";
