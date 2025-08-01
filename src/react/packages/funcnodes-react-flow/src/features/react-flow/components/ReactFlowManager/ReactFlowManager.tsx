import * as React from "react";
import { useReactFlow } from "@xyflow/react";
import { useFuncNodesContext } from "@/providers";

export const ReactFlowManager = () => {
  const rfinstance = useReactFlow();
  const fnrf_zst = useFuncNodesContext();
  fnrf_zst.rf_instance = rfinstance;

  return <></>;
};
