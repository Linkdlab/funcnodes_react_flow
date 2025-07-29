import {
  DataViewRendererType,
  DefaultImageRenderer,
  SVGImageRenderer,
  TableRender,
  StringValueRenderer,
  DictRenderer,
  Base64BytesRenderer,
} from ".";

export const FallbackDataViewRenderer = DictRenderer;

export const DefaultDataViewRenderer: {
  [key: string]: DataViewRendererType | undefined;
} = {
  string: StringValueRenderer,
  str: StringValueRenderer,
  table: TableRender,
  image: DefaultImageRenderer,
  svg: SVGImageRenderer,
  dict: DictRenderer,
  bytes: Base64BytesRenderer,
};
