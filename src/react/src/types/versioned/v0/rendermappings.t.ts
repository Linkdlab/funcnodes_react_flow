import { JSX } from "react";
import { IOType } from "./io.t";

export interface InputRendererProps {
  io: IOType;
  inputconverter: [(v: any) => any, (v: any) => any];
}
export type InputRendererType = ({
  io,
  inputconverter,
}: InputRendererProps) => JSX.Element;
export type OutputRendererProps = {
  io: IOType;
};
export type OutputRendererType = ({ io }: OutputRendererProps) => JSX.Element;

export type DataViewRendererProps = {
  io: IOType;
};
export type DataViewRendererType = ({
  io,
}: DataViewRendererProps) => JSX.Element;

export type HandlePreviewRendererProps = {
  io: IOType;
};
export type HandlePreviewRendererType = ({
  io,
}: HandlePreviewRendererProps) => JSX.Element;

export type DataOverlayRendererProps = {
  io: IOType;
};
export type DataOverlayRendererType = ({
  io,
}: DataOverlayRendererProps) => JSX.Element;

export type DataPreviewViewRendererProps = {
  io: IOType;
};
export type DataPreviewViewRendererType = ({
  io,
}: DataPreviewViewRendererProps) => JSX.Element;
