interface BaseEdgeAction {
  type: string;
  src_nid: string;
  src_ioid: string;
  trg_nid: string;
  trg_ioid: string;
  from_remote: boolean;
}

interface EdgeActionAdd extends BaseEdgeAction {
  type: "add";
}

interface EdgeActionDelete extends BaseEdgeAction {
  type: "delete";
}

type EdgeAction = EdgeActionAdd | EdgeActionDelete;

export type { EdgeAction, EdgeActionAdd, EdgeActionDelete };
