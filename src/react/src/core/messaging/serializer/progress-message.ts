import { ProgressState } from "@/funcnodes-context";

export interface ProgressStateMessage extends ProgressState {
  type: "progress";
}
