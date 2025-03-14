import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import ReactFlow, {
  Background,
  Edge,
  EdgeTypes,
  MiniMap,
  NodeTypes,
  useEdges,
  useKeyPress,
  useNodes,
  useReactFlow,
  Node,
} from "reactflow";

import { FuncNodesContext } from "../funcnodesreactflow";
import { useShallow } from "zustand/react/shallow";
import { RFState } from "../../states/reactflow.t";
import DefaultNode from "../node";
import DefaultEdge from "../edge";
import { NodeType } from "../../states/node.t";
import {
  FuncNodesReactFlowZustandInterface,
  ReactFlowLayerProps,
} from "../../states/fnrfzst.t";

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

const KeyHandler = () => {
  const fnrf_zst = useContext(FuncNodesContext);
  const delPressed = useKeyPress("Delete");
  const edges = useEdges();
  const nodes = useNodes();
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
  }

  return <></>;
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
  const node: NodeType = nodestore.use();

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

export default ReactFlowLayer;
export { nodeTypes };
