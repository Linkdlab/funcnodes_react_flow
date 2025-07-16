import * as React from "react";
import { useContext} from "react";
import {
  FuncNodesReactFlowZustandInterface,
  FuncnodesReactHeaderProps,
} from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";

import { development } from "../../utils/debugger";
import { FloatContainer } from "../layout/components";
import { NodeSpaceMenu } from "./nodespacemenu";
import { WorkerMenu } from "./workermenu";
import { SettingsMenu } from "./settingsmenu";

const Statusbar = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
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



const FuncnodesHeader = ({ ...headerprops }: FuncnodesReactHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

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
      {(headerprops.showmenu || development) && (
        <FloatContainer direction="row" wrap>
          <div className="headerelement">
            <WorkerMenu></WorkerMenu>
          </div>
          {((fnrf_zst.worker && workerstate.is_open) || development) && (
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

export default FuncnodesHeader;
export { Statusbar };
