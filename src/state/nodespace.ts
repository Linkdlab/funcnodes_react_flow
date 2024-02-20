import React, { useRef, useState } from "react";
import { useStore, create, UseBoundStore, StoreApi } from "zustand";
import {
  NodeStore,
  NodeType,
  createNodeStore,
  NodeAction,
  PartialNodeType,
  assert_full_node,
} from "./node";
import { deep_merge } from "./";
import { RefObject } from "react";

/**
 * Interface for the NodeSpaceZustand state management.
 * This interface is used to define the shape of the state and the actions that can be performed on it.
 */
interface NodeSpaceZustandInterface {
  // A Map object that holds NodeStore objects. The key is a string (node id), and the value is a NodeStore.
  nodesstates: Map<string, NodeStore>;

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

const NodeSpaceZustand =
  ({}: NodeSpaceZustandProps): NodeSpaceZustandInterface => {
    const nodesstates = new Map<string, NodeStore>();

    // const update_node = ({
    //   nid,
    //   node,
    //   from_remote,
    // }: {
    //   nid: string;
    //   node: PartialNodeType;
    //   from_remote: boolean;
    // }) => {};
    // const add_node = ({
    //   node,
    //   from_remote,
    // }: {
    //   node: NodeType;
    //   from_remote: boolean;
    // }) => {
    //   node = assert_full_node(node);
    //   const store = nodesstates.get(node.id);

    //   if (store) {
    //     update_node({ nid: node.id, node: node, from_remote });
    //   } else {
    //     nodesstates.set(node.id, createNodeStore(node));

    //     _on_node_action({
    //       type: "add",
    //       node: node,
    //       id: node.id,
    //       from_remote: from_remote,
    //     });
    //   }
    // };

    // const set_value = ({
    //   node,
    //   io,
    //   value,
    //   set_default,
    // }: {
    //   node: string;
    //   io: string;
    //   value: any;
    //   set_default?: boolean;
    // }) => {
    //   const store = nodesstates.get(node);
    //   if (store) {
    //     const state = store.getState();
    //     if (!state.io[io]) {
    //       throw new Error(`IO ${io} not found in node ${node}`);
    //     }
    //     const new_state: PartialNodeType = {
    //       io: {
    //         [io]: {
    //           value: value,
    //         },
    //       },
    //     };

    //     update_node({ nid: node, node: new_state, from_remote: false });
    //   }
    // };

    return {
      nodesstates: nodesstates,
      // add_node: add_node,
      // update_node: update_node,
      // set_value: set_value,
    };
  };

export default NodeSpaceZustand;
export type { NodeType, NodeSpaceZustandInterface };
