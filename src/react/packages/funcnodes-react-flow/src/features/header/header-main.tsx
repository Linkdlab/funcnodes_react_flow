import * as React from "react";
import { FuncnodesReactHeaderProps } from "@/app";

import { useFuncNodesContext } from "@/providers";
import { FloatContainer } from "@/shared-components/auto-layouts";
import { Statusbar } from "./statusbar";
import { isDevelopment } from "@/utils/debugger";
import { WorkerMenu } from "./workermenu";
import { NodeSpaceMenu } from "./nodespacemenu";
import { SettingsMenu } from "./settingsmenu";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const FuncnodesHeader = ({
  ...headerprops
}: FuncnodesReactHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();

  const workerstate = fnrf_zst.workerstate();
  // pserudouse headerprops
  if (Object.keys(headerprops).length > 0) {
    fnrf_zst.logger.debug("headerprops", headerprops);
  }

  return (
    <FloatContainer className="funcnodesreactflowheader" direction="row" wrap>
      <FloatContainer
        className="headerelement m-w-6"
        grow={{
          "": true,
          m: false,
        }}
      >
        <Statusbar></Statusbar>
      </FloatContainer>
      {(headerprops.showmenu || isDevelopment()) && (
        <FloatContainer direction="row" wrap>
          <div className="headerelement">
            <WorkerMenu></WorkerMenu>
          </div>
          {((fnrf_zst.worker && workerstate.is_open) || isDevelopment()) && (
            <div className="headerelement">
              <NodeSpaceMenu></NodeSpaceMenu>
            </div>
          )}
          <div className="headerelement">
            <SettingsMenu></SettingsMenu>
          </div>
        </FloatContainer>
      )}
    </FloatContainer>
  );
};
