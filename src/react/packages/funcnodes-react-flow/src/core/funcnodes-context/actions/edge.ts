export interface BaseEdgeAction {
  type: string;
  src_nid: string;
  src_ioid: string;
  trg_nid: string;
  trg_ioid: string;
  from_remote: boolean;
}

export interface EdgeActionAdd extends BaseEdgeAction {
  type: "add";
}

export interface EdgeActionDelete extends BaseEdgeAction {
  type: "delete";
}

export type EdgeAction = EdgeActionAdd | EdgeActionDelete;
