import { NodeType } from "../interfaces/node";
import { NormalizedPartialSerializedNodeType } from "./normalization";
import { default_node_factory } from "./default";
import { deserialize_node } from "./deserialization";

export const assert_full_node = (
  node: NormalizedPartialSerializedNodeType
): NodeType => {
  if (!node.id) {
    throw new Error("Node must have an id");
  }

  const new_obj = default_node_factory(node);

  const desernode: NodeType = deserialize_node(new_obj);

  return desernode;
};
