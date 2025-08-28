import { SerializedNodeType, PartialSerializedNodeType } from "@/nodes-core";

export interface BaseNodeAction {
  type: string;
  from_remote: boolean;
  id: string;
  immediate?: boolean;
}

export interface NodeActionDelete extends BaseNodeAction {
  type: "delete";
}
export interface NodeActionError extends BaseNodeAction {
  type: "error";
  errortype: string;
  error: string;
  tb?: string;
}

export interface NodeActionTrigger extends BaseNodeAction {
  type: "trigger";
}

export interface NodeActionUpdate extends BaseNodeAction {
  type: "update";
  node: PartialSerializedNodeType;
}

export interface NodeActionAdd extends BaseNodeAction {
  type: "add";
  node: SerializedNodeType;
}

export type NodeAction =
  | NodeActionAdd
  | NodeActionUpdate
  | NodeActionDelete
  | NodeActionError
  | NodeActionTrigger;
