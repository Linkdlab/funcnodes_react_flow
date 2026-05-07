import type { SerializedNodeType, SerializedType } from "./index";
import type { NodeGroups } from "@/groups";

/**
 * Stable mapping between one public `GroupNode` boundary IO and its matching
 * gateway IO inside the group's private nodespace.
 */
export interface GroupInterfaceBinding {
  id: string;
  direction: "input" | "output";
  public_io: string;
  gateway_node: string;
  gateway_io: string;
  name: string;
  type: SerializedType;
  description?: string;
  required?: boolean;
  default?: unknown;
  allow_multiple?: boolean;
  does_trigger?: boolean;
  render_options?: unknown;
  value_options?: unknown;
}

/**
 * Serialized private nodespace stored inside an executable `GroupNode` payload.
 */
export interface ExecutableGroupNodeSpaceJSON {
  nodes: SerializedNodeType[];
  edges: [string, string, string, string][];
  prop: { [key: string]: unknown };
  groups?: NodeGroups;
}

/**
 * Versioned serialized executable group data stored in
 * `SerializedNodeType.properties.group`.
 */
export interface GroupNodePayload {
  version: number;
  inner_nodespace: ExecutableGroupNodeSpaceJSON;
  input_gateway_node: string;
  output_gateway_node: string;
  input_bindings: Record<string, GroupInterfaceBinding>;
  output_bindings: Record<string, GroupInterfaceBinding>;
}
