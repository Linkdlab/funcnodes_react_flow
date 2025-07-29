import { JSX } from "react";
import { NodeType } from "./node.t";
import { NodeContextType } from "@/nodes";

export interface NodeContextExtenderProps {
  node_data: NodeType;
}
export type NodeContextExtenderType = ({
  node_data,
}: NodeContextExtenderProps) => {
  [key: string]: any | undefined;
};

export interface NodeRendererProps {
  node_data: NodeType;
}
export type NodeRendererType = ({
  node_data,
}: NodeRendererProps) => JSX.Element;

export type NodeHooksProps = {
  nodecontext: NodeContextType;
};
export type NodeHooksType = ({ nodecontext }: NodeHooksProps) => void;
