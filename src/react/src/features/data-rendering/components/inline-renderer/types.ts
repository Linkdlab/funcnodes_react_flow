import { IOStore } from "@/nodes-core";

export interface InLineRendererProps {
  iostore: IOStore;
}
export type InLineRendererType = ({ iostore }: InLineRendererProps) => string;
