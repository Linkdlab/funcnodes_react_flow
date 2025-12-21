import { DataViewRendererToInputRenderer } from "../../utils";
import { Base64BytesRenderer } from "../data-view-renderer";
import { BooleanInput } from "./boolean";
import { ColorInput } from "./color";
import { FloatInput, IntegerInput } from "./numbers";
import { SelectionInput } from "./selection";
import { StringInput } from "./text";
import { InputRendererType } from "./types";
import { JsonSchemaInput } from "./json_schema";

export const DefaultInputRenderer: {
  [key: string]: InputRendererType | undefined;
} = {
  float: FloatInput,
  int: IntegerInput,
  bool: BooleanInput,
  string: StringInput,
  str: StringInput,
  color: ColorInput,
  select: SelectionInput,
  enum: SelectionInput,
  json_schema: JsonSchemaInput,
  bytes: DataViewRendererToInputRenderer(Base64BytesRenderer, ""),
};
