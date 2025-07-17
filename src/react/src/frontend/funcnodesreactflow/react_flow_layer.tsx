import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ReactFlow,
  Background,
  Edge,
  EdgeTypes,
  MiniMap,
  useKeyPress,
  useReactFlow,
  Node,
  NodeTypes,
  OnNodesChange,
} from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";
import { RFState } from "../../states/reactflow.t";
import DefaultNode from "../node";
import DefaultEdge from "../edge";
import { FuncNodesReactFlowZustandInterface } from "../../states/fnrfzst.t";

import { latest } from "../../types/versioned/versions.t";
import { groupNodes, removeGroup as removeGroups } from "../../utils/grouping";
import { DefaultGroup } from "../group";
import { split_rf_nodes, useNodeTools } from "../../utils/nodes";
import { useFuncNodesContext } from "@/providers";
import { ReactFlowLayerProps } from "src/app/app.types";

// import { useForceGraph } from "../../utils/autolayout";

const selector = (state: RFState) => ({
  nodes: state.getNodes(),
  edges: state.getEdges(),
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const nodeTypes: NodeTypes = { default: DefaultNode, group: DefaultGroup };

const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
};

const past_clipboard_data = async (
  data: string,
  fnrf_zst: FuncNodesReactFlowZustandInterface,
  onNodesChange: OnNodesChange
) => {
  try {
    if (!data) return;
    const copydata: {
      nodes: latest.SerializedNodeType[];
      edges: latest.SerializedEdge[];
    } = JSON.parse(data);
    if (!copydata) return;
    if (!fnrf_zst.worker) return;
    if (!copydata.nodes) return;

    const mean_position = [0, 0];
    for (const node of copydata.nodes) {
      mean_position[0] += node.properties["frontend:pos"][0];
      mean_position[1] += node.properties["frontend:pos"][1];
    }
    mean_position[0] /= copydata.nodes.length;
    mean_position[1] /= copydata.nodes.length;

    const rel_node_infos: {
      id: string;
      src_id: string;
      position: [number, number];
      new_id?: string;
    }[] = [];
    for (const node of copydata.nodes) {
      const rel_node_info: {
        id: string;
        src_id: string;
        position: [number, number];
      } = {
        id: node.node_id,
        src_id: node.id,
        position: [
          node.properties["frontend:pos"][0] - mean_position[0],
          node.properties["frontend:pos"][1] - mean_position[1],
        ],
      };
      rel_node_infos.push(rel_node_info);
    }

    for (const node of rel_node_infos) {
      const new_node = await fnrf_zst.worker.add_node(node.id);
      if (!new_node) continue;
      const newnodestore = fnrf_zst.nodespace.get_node(new_node.id, false);
      if (!newnodestore) continue;
      node.new_id = new_node.id;

      onNodesChange([
        {
          id: new_node.id,
          type: "position",
          position: {
            x: node.position[0] + new_node.properties["frontend:pos"][0],
            y: node.position[1] + new_node.properties["frontend:pos"][1],
          },
        },
      ]);
    }

    for (const edge of copydata.edges) {
      const src_node = rel_node_infos.find(
        (node) => node.src_id === edge.src_nid
      );
      const trg_node = rel_node_infos.find(
        (node) => node.src_id === edge.trg_nid
      );
      if (!src_node || !trg_node) continue;
      if (!src_node.new_id || !trg_node.new_id) continue;
      fnrf_zst.worker.add_edge({
        src_nid: src_node.new_id,
        src_ioid: edge.src_ioid,
        trg_nid: trg_node.new_id,
        trg_ioid: edge.trg_ioid,
      });
    }
  } catch (err) {
    console.error("Failed to process pasted data:", err);
    // Potentially alert user: "Paste failed. Clipboard data may not be valid."
  }
};

const ReactFlowManager = () => {
  const rfinstance = useReactFlow();
  const fnrf_zst = useFuncNodesContext();
  fnrf_zst.rf_instance = rfinstance;
  // useForceGraph();

  return <></>;
};

const KeyHandler = () => {
  const fnrf_zst = useFuncNodesContext();
  const delPressed = useKeyPress("Delete");
  const copyPressed = useKeyPress(["Meta+c", "Control+c", "Strg+c"]);
  const groupPressed = useKeyPress(["Control+g", "Meta+g"]);
  const ungroupPressed = useKeyPress(["Control+Alt+g", "Meta+Alt+g"]);

  const { getEdges } = useReactFlow();
  const { getNodes, getSelectedNodes, getSplitNodes } = useNodeTools();

  // --- Deletion Logic ---
  useEffect(() => {
    if (delPressed) {
      if (!fnrf_zst.worker) return;

      const selectedEdges = getEdges().filter((e) => e.selected);
      for (const edge of selectedEdges) {
        if (
          !edge.source ||
          !edge.target ||
          !edge.sourceHandle ||
          !edge.targetHandle
        )
          continue;
        fnrf_zst.worker.remove_edge({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }

      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      for (const node of default_nodes) {
        fnrf_zst.worker.remove_node(node.id);
      }
      for (const node of group_nodes) {
        fnrf_zst.worker.remove_group(node.id);
      }
    }
  }, [delPressed, getNodes, getEdges, fnrf_zst]); // Dependencies for the effect

  // --- Copy Logic ---
  useEffect(() => {
    if (copyPressed) {
      const nodes = getNodes();
      const edges = getEdges();
      const selectedNodes = nodes.filter((n) => n.selected);

      if (selectedNodes.length === 0) return;

      const copydata: {
        nodes: latest.SerializedNodeType[];
        edges: latest.SerializedEdge[];
      } = { nodes: [], edges: [] };

      for (const node of selectedNodes) {
        const fnnode = fnrf_zst.nodespace.get_node(node.id, false);
        if (fnnode) {
          copydata.nodes.push(fnnode.serialize());
        }
      }

      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const internalEdges = edges.filter(
        (edge) =>
          selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
      );

      for (const edge of internalEdges) {
        if (!edge.sourceHandle || !edge.targetHandle) continue;
        copydata.edges.push({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }

      navigator.clipboard.writeText(JSON.stringify(copydata));
    }
  }, [copyPressed, getNodes, getEdges, fnrf_zst]); // Dependencies for the effect

  // --- Grouping Logic ---
  useEffect(() => {
    // Only run if the key is pressed
    if (groupPressed) {
      const selectedNodes = getSelectedNodes();
      const { group_nodes, default_nodes } = getSplitNodes(selectedNodes);
      if (selectedNodes.length > 0) {
        // This will now only run once when groupPressed becomes true
        groupNodes(
          default_nodes.map((n) => n.id),
          group_nodes.map((n) => n.id),
          fnrf_zst
        );
      }
    }
  }, [groupPressed, getNodes, fnrf_zst]); // Dependencies for the effect

  useEffect(() => {
    if (ungroupPressed) {
      console.log("ungroupPressed");
      const selectedNodes = getSelectedNodes();
      const { group_nodes } = getSplitNodes(selectedNodes);
      if (group_nodes.length > 0) {
        removeGroups(
          group_nodes.map((n) => n.id),
          fnrf_zst
        );
      }
    }
  }, [ungroupPressed, getNodes, fnrf_zst]); // Dependencies for the effect

  return (
    <>
      {/* <textarea
        ref={inputRef}
        onPaste={handlePaste}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      /> */}
    </>
  );
};

type ContextMenuProps = {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClick?: () => void;
};

const ContextMenu = ({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) => {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  const fnrf_zst = useFuncNodesContext();

  const duplicateNode = useCallback(() => {
    const rfnode = getNode(id);
    if (!rfnode) return;
    const position = {
      x: rfnode.position.x + 50,
      y: rfnode.position.y + 50,
    };

    addNodes({ ...rfnode, id: `${rfnode.id}-copy`, position });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    fnrf_zst.on_node_action({ type: "delete", id, from_remote: false });
  }, [id, setNodes, setEdges]);

  const nodestore = fnrf_zst.nodespace.get_node(id, false);
  if (!nodestore) return <> </>;
  const node: latest.NodeType = nodestore.use();

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <p style={{ fontWeight: "bold" }}>
        <small>{node.name}</small>
      </p>
      <button onClick={duplicateNode}>duplicate</button>
      <button onClick={deleteNode}>delete</button>
    </div>
  );
};

export const ReactFlowLayer = (props: ReactFlowLayerProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface = useFuncNodesContext();

  const reactflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fnrf_zst.reactflowRef = reactflowRef.current;
  }, [reactflowRef]);

  const [menu, setMenu] = useState<ContextMenuProps | null>(null);
  const onSelectionChange = ({
    nodes,
    edges,
  }: {
    nodes: Node[];
    edges: Edge[];
  }) => {
    const { group_nodes, default_nodes } = split_rf_nodes(nodes);

    const cs = fnrf_zst.local_state.getState();
    fnrf_zst.local_state.setState({
      ...cs,
      selected_nodes: default_nodes.map((node) => node.id),
      selected_edges: edges.map((edge) => edge.id),
      selected_groups: group_nodes.map((node) => node.id),
    });
  };

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    fnrf_zst.useReactFlowStore(useShallow(selector));

  return (
    <div className="reactflowlayer">
      <ReactFlow
        onPasteCapture={(e: React.ClipboardEvent<HTMLDivElement>) => {
          const reftarget = reactflowRef.current;
          if (!reftarget) return;
          let current_target = e.target;
          let steps = 0;
          while (current_target && (current_target as any).parentElement) {
            if (current_target === reftarget) {
              break;
            }
            steps++;
            current_target = (current_target as any).parentElement;
          }
          fnrf_zst.logger.debug(`onPasteCapture: ${steps} steps to reactflow`);
          if (steps <= 2) {
            past_clipboard_data(
              e.clipboardData.getData("text/plain"),
              fnrf_zst,
              onNodesChange
            );
          }
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={props.minZoom}
        maxZoom={props.maxZoom}
        fitView
        onSelectionChange={onSelectionChange}
        ref={reactflowRef}
        //  onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        //multiSelectionKeyCode="Control"
        panOnDrag={!props.static}
      >
        <ReactFlowManager />
        <KeyHandler />
        <Background
          color="#888" // Color of the grid lines
          gap={16} // Distance between grid lines
          size={1} // Thickness of the grid lines
        />
        {props.minimap && (
          <MiniMap
            nodeStrokeWidth={3}
            pannable={!props.static}
            zoomable={!props.static}
            zoomStep={3}
          />
        )}
        {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
      </ReactFlow>
    </div>
  );
};

export { nodeTypes };
