import { useEffect, useState } from "react";
import { NodeStore } from "@/nodes-core";

export const useDefaultNodeInjection = (nodestore: NodeStore) => {
  const [visualTrigger, setVisualTrigger] = useState(false);
  const in_trigger = nodestore.use((state) => state.in_trigger);
  // const fnrf_zst = useFuncNodesContext();

  // const { hooks } = useWorkerApi();

  // const renderplugins = useContext(RenderMappingContext);

  // const nodeHooks = renderplugins.NodeHooks[node_id];

  // for (const hook of nodeHooks || []) {
  //   try {
  //     hook({ nodestore: nodestore });
  //   } catch (error) {
  //     console.error(error);
  //     fnrf_zst.logger.error(
  //       "Error calling node hook",
  //       error instanceof Error ? error.message : String(error)
  //     );
  //   }
  // }

  // Call a hook when the node is mounted.
  // useEffect(() => {
  //   hooks?.call_hooks("node_mounted", instance_id);
  // }, [hooks, instance_id]);

  // Manage visual trigger state based on the node's in_trigger flag.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (in_trigger && !visualTrigger) {
      setVisualTrigger(true);
    } else if (visualTrigger) {
      timeoutId = setTimeout(() => setVisualTrigger(false), 200);
    }
    return () => clearTimeout(timeoutId);
  }, [in_trigger, visualTrigger]);

  return { visualTrigger, nodestore };
};
