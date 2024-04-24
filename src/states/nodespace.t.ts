import { NodeStore } from "./node.t";

/**
 * Interface for the NodeSpaceZustand state management.
 * This interface is used to define the shape of the state and the actions that can be performed on it.
 */
interface NodeSpaceZustandInterface {
  // A Map object that holds NodeStore objects. The key is a string (node id), and the value is a NodeStore.
  nodesstates: Map<string, NodeStore>;

  get_node: (nid: string, raise?: boolean) => NodeStore | undefined;

  // A function to add a new node to the nodesstates Map. It takes a NodeType object as a parameter.
  // add_node: ({
  //   node,
  //   from_remote,
  // }: {
  //   node: NodeType;
  //   from_remote: boolean;
  // }) => void;

  // // A function to update an existing node in the nodesstates Map.
  // // It takes a node id (string) and a PartialNodeType object (which contains the properties to be updated) as parameters.
  // update_node: ({
  //   nid,
  //   node,
  //   from_remote,
  // }: {
  //   nid: string;
  //   node: PartialNodeType;
  //   from_remote: boolean;
  // }) => void;

  // set_value: ({
  //   node,
  //   io,
  //   value,
  //   set_default,
  // }: {
  //   node: string;
  //   io: string;
  //   value: any;
  //   set_default?: boolean | undefined;
  // }) => void;
}

/**
 * Interface for the NodeSpaceZustandProps.
 * This interface is used to define the properties that can be passed to the NodeSpaceZustand component.
 */
interface NodeSpaceZustandProps {
  // Optional callback function that is invoked when a node action occurs.
  // The function takes a NodeAction object as a parameter.
  // on_node_action?: (action: NodeAction) => void;
}

export type { NodeSpaceZustandProps, NodeSpaceZustandInterface };
