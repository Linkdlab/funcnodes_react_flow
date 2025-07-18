import * as React from "react";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";
import { useFuncNodesContext } from "@/providers";

export const Statusbar = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
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
