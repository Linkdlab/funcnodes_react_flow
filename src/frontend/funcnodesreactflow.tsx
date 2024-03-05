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
  NodeTypes,
  EdgeTypes,
  useKeyPress,
  useEdges,
} from "reactflow";
import Library from "./lib";
import FuncNodesReactFlowZustand, {
  FuncNodesReactFlowZustandInterface,
} from "../state";

import DefaultNode from "./node";
import { NodeType } from "../state/node";
import ConnectionLine from "./edge";

import "./nodecontextmenu.scss";
import DefaultEdge from "./edge";
import { Key } from "@mui/icons-material";

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

  const nodestore = fnrf_zst.nodespace.get_node(id, false);
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

const nodeTypes: NodeTypes = { default: DefaultNode };

const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
};

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
    <div className="reactflowlayer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={2}
        fitView
        ref={reactflowRef}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        //multiSelectionKeyCode="Control"
      >
        <ReactFlowManager />
        <KeyHandler />
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
    </div>
  );
};

const FuncnodesHeader = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const onNew = () => {
    const alert = window.confirm("Are you sure you want to start a new flow?");
    if (alert) {
      fnrf_zst.worker?.clear();
    }
  };

  const onSave = async () => {
    const data = await fnrf_zst.worker?.save();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const onOpen = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const contents = e.target?.result;
        if (!contents) return;
        const data = JSON.parse(contents as string);
        await fnrf_zst.worker?.load(data);
      };
      reader.readAsText(file);
    };
    input.click();
  };
  return (
    <div className="funcnodesreactflowheader">
      <button onClick={onNew}>new</button>
      <button onClick={onOpen}>open</button>
      <button onClick={onSave}>save</button>
    </div>
  );
};

const KeyHandler = () => {
  const fnrf_zst = useContext(FuncNodesContext);
  const delPressed = useKeyPress("Delete");
  const edges = useEdges();

  if (delPressed) {
    for (const edge of edges) {
      if (edge.selected) {

        if (!fnrf_zst.worker) return <></>;
        if (!edge.source || !edge.target) return <></>;
        if (!edge.sourceHandle || !edge.targetHandle) return <></>;
        fnrf_zst.worker?.remove_edge({
          src_nid: edge.source,
          src_ioid: edge.sourceHandle,
          trg_nid: edge.target,
          trg_ioid: edge.targetHandle,
        });
      }
    }
  }

  return <></>;
};

const FuncnodesReactFlow = () => {
  const fnrf_zst = FuncNodesReactFlowZustand();
  const worker = new WebSocketWorker("ws://localhost:9382", fnrf_zst);
  fnrf_zst.worker = worker;

  return (
    <FuncNodesContext.Provider value={fnrf_zst}>
      <div className="funcnodesreactflowcontainer">
        <FuncnodesHeader></FuncnodesHeader>
        <div className="funcnodesreactflowbody">
          <Library></Library>
          <ReactFlowLayer></ReactFlowLayer>
        </div>
      </div>
    </FuncNodesContext.Provider>
  );
};
export default FuncnodesReactFlow;
export { FuncNodesContext };
