import * as React from "react";
import { useState } from "react";

import {
  FullscreenIcon,
  FullscreenExitIcon,
  OpenInFullIcon,
  CloseFullscreenIcon,
} from "@/icons";

import { KeyPressProvider, ThemeProvider } from "@/providers";
import { FuncNodesWorker } from "@/workers";
import { FuncNodesContext } from "@/providers";
import {
  AVAILABLE_COLOR_THEMES,
  FuncnodesReactHeaderProps,
  ReactFlowLayerProps,
  ReactFlowLibraryProps,
} from "@/app";
import {
  FuncNodesReactFlowZustandInterface,
  ReactFlowLayer,
  RenderMappingProvider,
} from "@/barrel_imports";
import {
  FullScreenComponent,
  SmoothExpandComponent,
} from "@/shared-components";
import { SizeContextContainer } from "@/shared-components/auto-layouts";
import { FuncnodesHeader } from "@/header";
import { Library } from "@/library";
import { NodeSettings } from "@/node-settings";

export const InnerFuncnodesReactFlow = ({
  fnrf_zst,
  header,
  flow,
  library,
}: {
  fnrf_zst: FuncNodesReactFlowZustandInterface;
  header: FuncnodesReactHeaderProps;
  flow: ReactFlowLayerProps;
  library: ReactFlowLibraryProps;
}) => {
  const [worker, setWorker] = useState<FuncNodesWorker | undefined>(
    fnrf_zst.options.worker
  );

  const ref = React.useRef<HTMLDivElement>(null);

  if (fnrf_zst.workermanager) {
    fnrf_zst.workermanager.on_setWorker = setWorker;
  }

  fnrf_zst.set_worker(worker);

  React.useEffect(() => {
    fnrf_zst.auto_progress();
  }, []);

  React.useEffect(() => {
    fnrf_zst.local_state.setState({ funcnodescontainerRef: ref.current });
  }, [ref]);

  const plugins = fnrf_zst.plugins();

  return (
    <ThemeProvider available_themes={AVAILABLE_COLOR_THEMES}>
      <RenderMappingProvider plugins={plugins} fnrf_zst={fnrf_zst}>
        <KeyPressProvider>
          <FuncNodesContext.Provider value={fnrf_zst}>
            <SmoothExpandComponent asChild>
              <FullScreenComponent asChild>
                <SizeContextContainer
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    ref={ref}
                    className="funcnodesreactflowcontainer funcnodescontainer"
                  >
                    {header.show && (
                      <FuncnodesHeader {...header}></FuncnodesHeader>
                    )}

                    <div className="funcnodesreactflowbody">
                      <ReactFlowLayer {...flow}></ReactFlowLayer>
                      {worker && library.show && <Library></Library>}
                      {worker && flow.showNodeSettings && (
                        <NodeSettings></NodeSettings>
                      )}
                    </div>
                    <div className="funcnodesflaotingmenu">
                      <FullScreenComponent.OutFullScreen>
                        {flow.allowExpand && (
                          <SmoothExpandComponent.Trigger>
                            <SmoothExpandComponent.Expanded>
                              <CloseFullscreenIcon
                                size="xl"
                                style={{ padding: "4px" }}
                              />
                            </SmoothExpandComponent.Expanded>
                            <SmoothExpandComponent.Collapsed>
                              <OpenInFullIcon
                                size="xl"
                                style={{ padding: "4px" }}
                              />
                            </SmoothExpandComponent.Collapsed>
                          </SmoothExpandComponent.Trigger>
                        )}
                      </FullScreenComponent.OutFullScreen>
                      {flow.allowFullScreen && (
                        <FullScreenComponent.Trigger>
                          <FullScreenComponent.OutFullScreen>
                            <FullscreenIcon
                              size="xl"
                              style={{ padding: "4px" }}
                            />
                          </FullScreenComponent.OutFullScreen>
                          <FullScreenComponent.InFullScreen>
                            <FullscreenExitIcon
                              size="xl"
                              style={{ padding: "4px" }}
                            />
                          </FullScreenComponent.InFullScreen>
                        </FullScreenComponent.Trigger>
                      )}
                    </div>
                  </div>
                </SizeContextContainer>
              </FullScreenComponent>
            </SmoothExpandComponent>
          </FuncNodesContext.Provider>
        </KeyPressProvider>
      </RenderMappingProvider>
    </ThemeProvider>
  );
};
