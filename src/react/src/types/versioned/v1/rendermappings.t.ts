import { JSX } from "react";
import { IOStore } from "./io.t";
import { NodeType } from "./node.t";
import { NodeContextType } from "@/barrel_imports";

export interface DataOverlayRendererProps {
  iostore: IOStore;
  value: any;
  preValue?: any;
  onLoaded?: () => void;
}
export type DataOverlayRendererType = ({
  iostore,
  value,
  preValue,
  onLoaded,
}: DataOverlayRendererProps) => JSX.Element;

export interface InputRendererProps {
  iostore: IOStore;
  inputconverter: [(v: any) => any, (v: any) => any];
}
export type InputRendererType = ({
  iostore,
  inputconverter,
}: InputRendererProps) => JSX.Element;

export type OutputRendererProps = {
  iostore: IOStore;
};
export type OutputRendererType = ({
  iostore,
}: OutputRendererProps) => JSX.Element;

export type DataViewRendererProps = {
  iostore: IOStore;
  value: any;
  preValue?: any;
  onLoaded?: () => void;
};
export type DataViewRendererType = ({
  iostore,
  value,
  preValue,
  onLoaded,
}: DataViewRendererProps) => JSX.Element;

export type HandlePreviewRendererProps = {
  iostore: IOStore;
};
export type HandlePreviewRendererType = ({
  iostore,
}: HandlePreviewRendererProps) => JSX.Element;

export type DataPreviewViewRendererProps = {
  iostore: IOStore;
};
export type DataPreviewViewRendererType = ({
  iostore,
}: DataPreviewViewRendererProps) => JSX.Element;

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

export interface InLineRendererProps {
  iostore: IOStore;
}
export type InLineRendererType = ({ iostore }: InLineRendererProps) => string;

export type NodeHooksProps = {
  nodecontext: NodeContextType;
};
export type NodeHooksType = ({ nodecontext }: NodeHooksProps) => void;
