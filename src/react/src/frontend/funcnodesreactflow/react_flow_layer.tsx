import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import {
  ReactFlow,
  Background,
  Edge,
  EdgeTypes,
  MiniMap,
  useEdges,
  useKeyPress,
  useNodes,
  useReactFlow,
  Node,
  NodeTypes,
  OnNodesChange,
} from "@xyflow/react";

import { FuncNodesContext } from "../funcnodesreactflow";
import { useShallow } from "zustand/react/shallow";
import { RFState } from "../../states/reactflow.t";
import DefaultNode from "../node";
import DefaultEdge from "../edge";
import {
  FuncNodesReactFlowZustandInterface,
  ReactFlowLayerProps,
} from "../../states/fnrfzst.t";

import { latest } from "../../types/versioned/versions.t";
import { update_node } from "../../states/node/update_node";

// import { useForceGraph } from "../../utils/autolayout";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const nodeTypes: NodeTypes = { default: DefaultNode };

const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
};

const ReactFlowManager = () => {
  const rfinstance = useReactFlow();
  const fnrf_zst = useContext(FuncNodesContext);
  fnrf_zst.rf_instance = rfinstance;
  // useForceGraph();

  return <></>;
};

const KeyHandler = ({ onNodesChange }: { onNodesChange: OnNodesChange }) => {
  const fnrf_zst = useContext(FuncNodesContext);
  const delPressed = useKeyPress("Delete");
  const copyPressed = useKeyPress(["Meta+c", "Control+c", "Strg+c"]);
  const pastePressed = useKeyPress(["Meta+v", "Control+v", "Strg+v"]);
  const edges = useEdges();
  const nodes = useNodes();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData?.getData("text");
    if (!pastedText) return;
    console.log("paste", pastedText);
    if (!pastedText) return;
    const copydata: {
      nodes: latest.SerializedNodeType[];
      edges: latest.SerializedEdge[];
    } = JSON.parse(pastedText);
    console.log("copydata", copydata);
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
      console.log("new_node", new_node);
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
  };

  if (delPressed) {
    for (const edge of edges) {
      if (edge.selected) {
        if (!fnrf_zst.worker) return <></>;
        if (!edge.source || !edge.target) return <></>;
        if (!edge.sourceHandle || !edge.targetHandle) return <></>;
        fnrf_zst.worker.remove_edge({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }
    }
    for (const node of nodes) {
      if (node.selected) {
        if (!fnrf_zst.worker) return <></>;
        fnrf_zst.worker.remove_node(node.id);
      }
    }
  } else if (copyPressed) {
    const copydata: {
      nodes: latest.SerializedNodeType[];
      edges: latest.SerializedEdge[];
    } = { nodes: [], edges: [] };
    for (const node of nodes) {
      if (node.selected) {
        const fnnode = fnrf_zst.nodespace.get_node(node.id, false);
        if (!fnnode) continue;
        copydata.nodes.push(fnnode.serialize());
      }
    }
    for (const edge of edges) {
      if (!edge.source || !edge.target) continue;
      if (!edge.sourceHandle || !edge.targetHandle) continue;
      // check if edge.source and edge.target are selected
      if (
        nodes.find((node) => node.id === edge.source)?.selected &&
        nodes.find((node) => node.id === edge.target)?.selected
      ) {
        copydata.edges.push({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }
    }

    // inject copydata into clipboard
    navigator.clipboard.writeText(JSON.stringify(copydata));
  } else if (pastePressed) {
    console.log("paste pressed");
    if (!inputRef.current) return;
    if (inputRef.current instanceof HTMLTextAreaElement) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }

  return (
    <>
      <textarea
        ref={inputRef}
        onPaste={handlePaste}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
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

  const fnrf_zst = useContext(FuncNodesContext);

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

const ReactFlowLayer = (props: ReactFlowLayerProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

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
    const cs = fnrf_zst.local_state.getState();
    fnrf_zst.local_state.setState({
      ...cs,
      selected_nodes: nodes.map((node) => node.id),
      selected_edges: edges.map((edge) => edge.id),
    });
  };

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    fnrf_zst.useReactFlowStore(useShallow(selector));

  return (
    <div className="reactflowlayer">
      <ReactFlow
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
        <KeyHandler onNodesChange={onNodesChange} />
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

export default ReactFlowLayer;
export { nodeTypes };
