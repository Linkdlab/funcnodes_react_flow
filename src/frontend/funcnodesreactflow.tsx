import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";
import { WebSocketWorker } from "../funcnodes";
import "./funcnodesreactflow.scss";
import useStore, { RFState } from "../state/reactflow";
import { shallow } from "zustand/shallow";
import { useShallow } from "zustand/react/shallow";
import ReactFlow, {
  Edge,
  Node,
  Background,
  ReactFlowProvider,
  MiniMap,
  useReactFlow,
  FitView,
} from "reactflow";
import Library from "./lib";
import FuncNodesReactFlowZustand, {
  FuncNodesReactFlowZustandInterface,
} from "../state";

import DefaultNode from "./node";
import { NodeType } from "../state/node";

import "./nodecontextmenu.scss";

const FuncNodesContext = createContext<FuncNodesReactFlowZustandInterface>(
  FuncNodesReactFlowZustand()
);

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

  const nodestore = fnrf_zst.nodespace.nodesstates.get(id);
  if (!nodestore) return <> </>;
  const node: NodeType = nodestore();

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

const ReactFlowManager = () => {
  const rfinstance = useReactFlow();
  const fnrf_zst = useContext(FuncNodesContext);
  fnrf_zst.rf_instance = rfinstance;
  return <></>;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const nodeTypes = { default: DefaultNode };

const ReactFlowLayer = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const reactflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fnrf_zst.reactflowRef = reactflowRef.current;
  }, [reactflowRef]);

  const [menu, setMenu] = useState<ContextMenuProps | null>(null);

  const onNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: Node) => {
      if (!reactflowRef.current) return;
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = reactflowRef.current.getBoundingClientRect();
      const clientX = event.clientX as number;
      const clientY = event.clientY as number;
      setMenu({
        id: node.id,
        top: clientY < pane.height - 200 ? clientY : undefined,
        left: clientX < pane.width - 200 ? clientX : undefined,
        right: clientX >= pane.width - 200 ? pane.width - clientX : undefined,
        bottom:
          clientY >= pane.height - 200 ? pane.height - clientY : undefined,
      });
    },
    [setMenu]
  );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    fnrf_zst.useReactFlowStore(useShallow(selector));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      minZoom={0.1}
      maxZoom={2}
      fitView
      ref={reactflowRef}
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
    >
      <ReactFlowManager />
      <Background
        color="#888" // Color of the grid lines
        gap={16} // Distance between grid lines
        size={1} // Thickness of the grid lines
      />
      <MiniMap
        nodeStrokeWidth={3}
        pannable={true}
        zoomable={true}
        zoomStep={3}
      />
      {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
    </ReactFlow>
  );
};

const FuncnodesReactFlow = () => {
  const fnrf_zst = FuncNodesReactFlowZustand();
  const worker = new WebSocketWorker("ws://localhost:9382", fnrf_zst);
  fnrf_zst.worker = worker;

  return (
    <FuncNodesContext.Provider value={fnrf_zst}>
      <div className="funcnodesreactflowcontainer">
        <Library></Library>
        <ReactFlowLayer></ReactFlowLayer>
      </div>
    </FuncNodesContext.Provider>
  );
};
export default FuncnodesReactFlow;
export { FuncNodesContext };
