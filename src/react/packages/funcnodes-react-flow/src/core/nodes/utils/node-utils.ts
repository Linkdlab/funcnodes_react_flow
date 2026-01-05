import type { DefaultRFNode, GroupRFNode } from "@/nodes";
import { Node, useReactFlow } from "@xyflow/react";

export const split_rf_nodes = (
  nodes: Node[]
): {
  group_nodes: GroupRFNode[];
  default_nodes: DefaultRFNode[];
} => {
  const used_node_ids: Set<string> = new Set();
  const group_nodes = nodes.filter(
    (node) => node.type === "group"
  ) as GroupRFNode[];
  group_nodes.forEach((node) => {
    used_node_ids.add(node.id);
  });

  const default_nodes = nodes.filter(
    (node) => !used_node_ids.has(node.id)
  ) as DefaultRFNode[];
  return { group_nodes, default_nodes };
};

export function sortByParent<T extends { id: string; parentId?: string }>(
  nodes: T[]
): T[] {
  // 1. Create a map for fast lookup of nodes by their ID.
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  // 2. Create a map to store children for each parent.
  const childrenByParentId = new Map();
  const roots = [];

  for (const node of nodes) {
    // Add an empty children array for each node to ensure all nodes are in the final hierarchy
    if (!childrenByParentId.has(node.id)) {
      childrenByParentId.set(node.id, []);
    }

    if (node.parentId && nodesById.has(node.parentId)) {
      const parent = nodesById.get(node.parentId);
      if (parent) {
        // Get the children list for the parent, creating it if it doesn't exist.
        const children = childrenByParentId.get(parent.id) || [];
        children.push(node);
        childrenByParentId.set(parent.id, children);
      } else {
        // It's a root node (parentId points to a non-existent node).
        roots.push(node);
      }
    } else {
      // It's a root node (no parentId or parentId points to a non-existent node).
      roots.push(node);
    }
  }

  // 3. Use a recursive function to perform a depth-first traversal.
  const sorted: T[] = [];
  function visit(node: T) {
    // Add the parent node to the result list first.
    sorted.push(node);

    // Then, recursively visit all of its children.
    const children = childrenByParentId.get(node.id) || [];
    for (const child of children) {
      visit(child);
    }
  }

  // 4. Start the traversal from all the root nodes.
  for (const root of roots) {
    visit(root);
  }

  // The final `sorted` array now contains all nodes in the correct order.
  // Note: if the input contained cycles or nodes that were part of a detached
  // subgraph not reachable from a root, they will not be in the `sorted` array.
  // The following check is optional but good for ensuring all nodes were processed.
  if (sorted.length !== nodes.length) {
    // This can happen if there's a circular dependency
    // or if a child's parentId exists but the parent node is missing from the input array.
    // You could throw an error or handle it as needed.
    console.warn(
      "Sorting mismatch: Not all nodes could be placed. Check for circular dependencies or missing parents."
    );
    // To include the missing nodes, you could append them at the end.
    const sortedIds = new Set(sorted.map((n) => n.id));
    nodes.forEach((node) => {
      if (!sortedIds.has(node.id)) {
        sorted.push(node);
      }
    });
  }

  return sorted;
}

export const useNodeTools = () => {
  const { getNodes } = useReactFlow();

  const getSelectedNodes = (nodes?: Node[]) => {
    if (nodes === undefined) {
      nodes = getNodes();
    }
    return nodes.filter((node) => node.selected);
  };

  const getSplitNodes = (nodes?: Node[]) => {
    if (nodes === undefined) {
      nodes = getNodes();
    }
    const { group_nodes, default_nodes } = split_rf_nodes(nodes);
    return { group_nodes, default_nodes };
  };

  const getSortedNodes = (nodes?: Node[]) => {
    if (nodes === undefined) {
      nodes = getNodes();
    }
    return sortByParent(nodes);
  };

  return {
    getNodes,
    getSelectedNodes,
    getSplitNodes,
    getSortedNodes,
  };
};
