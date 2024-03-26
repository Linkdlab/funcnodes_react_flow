interface NodeType {
  id: string;
  node_name: string;
  io: { [key: string]: IOType };
  frontend: {
    pos: [number, number];
    size: [number, number];
    collapsed: boolean;
  };
  name: string;
  in_trigger: boolean;
  error?: string;
  render_options?: NodeRenderOptions;
  io_order: string[];
}

type PartialNodeType = DeepPartial<NodeType>;