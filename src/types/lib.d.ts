type LibNode = {
  node_id: string;
  description?: string;
  node_name?: string;
};

type Shelf = {
  name: string;
  description?: string;
  nodes: LibNode[];
  subshelves: Shelf[];
};

type LibType = {
  shelves: Shelf[];
};
