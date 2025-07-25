import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../../states/fnrfzst.t";
import { useFuncNodesContext } from "@/providers";
import { RenderMappingContext } from "../../../frontend/datarenderer/rendermappings";
import { latest } from "../../../types/versioned/versions.t";

export const useDefaultNodeInjection = (storedata: latest.NodeType) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const [visualTrigger, setVisualTrigger] = useState(false);
  const intrigger = storedata.in_trigger();

  const renderplugins = useContext(RenderMappingContext);

  // Memoize additionalContext so that it only recomputes when
  // either the extender function or storedata changes.
  const nodeContextExtender =
    renderplugins.NodeContextExtenders[storedata.node_id];
  const additionalContext = React.useMemo(
    () => nodeContextExtender?.({ node_data: storedata }) || {},
    [nodeContextExtender, storedata]
  );

  // Memoize nodecontext so that it's recreated only if additionalContext or storedata change.
  const nodecontext = React.useMemo(
    () => ({ ...additionalContext, node_data: storedata }),
    [additionalContext, storedata]
  );

  const nodeHooks = renderplugins.NodeHooks[storedata.node_id];
  for (const hook of nodeHooks || []) {
    hook({ nodecontext: nodecontext });
  }

  // Call a hook when the node is mounted.
  useEffect(() => {
    fnrf_zst.worker?.call_hooks("node_mounted", storedata.id);
  }, [fnrf_zst.worker, storedata.id]);

  // Manage visual trigger state based on the node's in_trigger flag.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (intrigger && !visualTrigger) {
      setVisualTrigger(true);
    } else if (visualTrigger) {
      timeoutId = setTimeout(() => setVisualTrigger(false), 200);
    }
    return () => clearTimeout(timeoutId);
  }, [intrigger, visualTrigger]);

  return { visualTrigger, nodecontext };
};