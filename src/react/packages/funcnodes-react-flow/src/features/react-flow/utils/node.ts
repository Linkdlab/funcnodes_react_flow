import type { FuncNodesReactFlow } from "@/funcnodes-context";
import type { RFNodeDataPass } from "@/nodes-components";
import type { NodeStore, NodeType } from "@/nodes-core";
import type { Node as RFNode } from "@xyflow/react";

const _fill_node_frontend = (
  node: NodeType,
  fnrf_instance?: FuncNodesReactFlow
) => {
  const nodeprops = node.properties || {};
  if (!nodeprops["frontend:size"]) {
    nodeprops["frontend:size"] = [200, 100];
  }
  const frontend_pos = nodeprops["frontend:pos"];
  if (
    !frontend_pos ||
    frontend_pos.length !== 2 ||
    isNaN(frontend_pos[0]) ||
    frontend_pos[0] === null ||
    isNaN(frontend_pos[1]) ||
    frontend_pos[1] === null
  ) {
    if (
      !fnrf_instance ||
      !fnrf_instance.rf_instance ||
      fnrf_instance.reactflowRef === null
    ) {
      nodeprops["frontend:pos"] = [0, 0];
    } else {
      const ref = fnrf_instance.reactflowRef;
      const rect = ref.getBoundingClientRect(); // Step 2: Get bounding rectangle
      const centerX = rect.left + rect.width / 2; // Calculate center X
      const centerY = rect.top + rect.height / 2; // Calculate center Y
      const flowpos = fnrf_instance.rf_instance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });
      nodeprops["frontend:pos"] = [
        flowpos.x - nodeprops["frontend:size"][0] / 2,
        flowpos.y - nodeprops["frontend:size"][0] / 2,
      ];
    }
  }

  if (!nodeprops["frontend:collapsed"]) {
    nodeprops["frontend:collapsed"] = false;
  }
  node.properties = nodeprops;
};

export const assert_reactflow_node = (
  store: NodeStore,
  fnrf_instance?: FuncNodesReactFlow
): NodeType & RFNode => {
  const node = store.getState();
  _fill_node_frontend(node, fnrf_instance);

  if (node.id === undefined) {
    throw new Error("Node must have an id");
  }

  const data: RFNodeDataPass = {
    nodestore: store,
  };

  const extendedNode: NodeType & RFNode = {
    position: {
      x: node.properties["frontend:pos"][0],
      y: node.properties["frontend:pos"][1],
    },
    data: data,
    type: "default",
    zIndex: 1003,
    // expandParent: true,
    ...node,
  };

  return extendedNode;
};
