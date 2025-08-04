import { NodeType } from "../interfaces/node";
import { default_node_factory } from "./default";
import { deserialize_node } from "./deserialization";
import { PartialNormalizedSerializedNodeType } from "../serializations";

export const assert_full_node = (
  node: PartialNormalizedSerializedNodeType
): NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const new_obj = default_node_factory(node);

  const desernode: NodeType = deserialize_node(new_obj);

  return desernode;
};
