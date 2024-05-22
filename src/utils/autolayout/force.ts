import * as d3 from "d3";
import { useEdges, useNodes, Node } from "reactflow";

interface SimNode extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  id: string;
  react_node: Node;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

const useForceGraph = () => {
  const edges = useEdges();
  const nodes = useNodes();

  const simulation_nodes: SimNode[] = nodes.map((node) => {
    return {
      x: node.position.x,
      y: node.position.y,
      id: node.id,
      react_node: node,
    };
  });

  const simulation_nodes_map: { [key: string]: SimNode } = {};
  for (const n of simulation_nodes) {
    simulation_nodes_map[n.id] = n;
  }

  const simulation_links: SimEdge[] = [];
  for (const e of edges) {
    if (e.sourceNode === undefined || e.targetNode === undefined) continue;
    simulation_links.push({
      source: simulation_nodes_map[e.sourceNode.id],
      target: simulation_nodes_map[e.targetNode.id],
    });
  }

  const simulation = d3
    .forceSimulation<SimNode>(simulation_nodes)
    .force(
      "link",
      d3
        .forceLink<SimNode, SimEdge>(simulation_links)
        .id((d) => d.id)
        .strength(10000),
    )
    .force("charge", d3.forceManyBody().strength(-100));
  // .force("x", d3.forceX())
  // .force("y", d3.forceY());

  simulation.on("tick", () => {
    for (const n of simulation_nodes) {
      n.react_node.position.x = n.x;
      n.react_node.position.y = n.y;
    }
  });
};

export default useForceGraph;
