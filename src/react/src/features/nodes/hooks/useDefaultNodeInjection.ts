import { useContext, useEffect, useState } from "react";
import { RenderMappingContext } from "@/data-rendering";
import { useWorkerApi } from "@/workers";
import { NodeStore } from "@/nodes-core";
import { useFuncNodesContext } from "@/providers";

export const useDefaultNodeInjection = (nodestore: NodeStore) => {
  const [visualTrigger, setVisualTrigger] = useState(false);
  const { intrigger, node_id, instance_id } = nodestore.useShallow((state) => ({
    intrigger: state.in_trigger,
    node_id: state.node_id,
    instance_id: state.id,
  }));
  const fnrf_zst = useFuncNodesContext();

  const { hooks } = useWorkerApi();

  const renderplugins = useContext(RenderMappingContext);

  const nodeHooks = renderplugins.NodeHooks[node_id];
  for (const hook of nodeHooks || []) {
    try {
      hook({ nodestore: nodestore });
    } catch (error) {
      fnrf_zst.logger.error(
        "Error calling node hook",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Call a hook when the node is mounted.
  useEffect(() => {
    hooks?.call_hooks("node_mounted", instance_id);
  }, [hooks, instance_id]);

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

  return { visualTrigger, nodestore };
};
