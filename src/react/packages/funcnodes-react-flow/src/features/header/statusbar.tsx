import * as React from "react";

import { useFuncNodesContext } from "@/providers";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const Statusbar = () => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const progress = fnrf_zst.progress_state();

  return (
    <div className="statusbar">
      <span
        className="statusbar-progressbar"
        style={{ width: Math.min(100, 100 * progress.progress) + "%" }}
      ></span>
      <span className="statusbar-message">{progress.message}</span>
    </div>
  );
};
