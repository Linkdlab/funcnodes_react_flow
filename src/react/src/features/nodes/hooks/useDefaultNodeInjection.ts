import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { latest } from "@/barrel_imports";
import { RenderMappingContext } from "@/data-rendering";
import { useWorkerApi } from "@/workers";

export const useDefaultNodeInjection = (storedata: latest.NodeType) => {
  const [visualTrigger, setVisualTrigger] = useState(false);
  const intrigger = storedata.in_trigger();

  const { hooks } = useWorkerApi();

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
    hooks?.call_hooks("node_mounted", storedata.id);
  }, [hooks, storedata.id]);

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
