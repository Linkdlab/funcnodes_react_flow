import {
  Base64BytesRenderer,
  DataViewRendererToInputRenderer,
} from "@/data-rendering";
import { BooleanInput, ColorInput, InputRendererType, StringInput } from ".";
import { FloatInput, IntegerInput } from "./numbers";
import { SelectionInput } from "./selection";

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
  bytes: DataViewRendererToInputRenderer(Base64BytesRenderer, ""),
};
