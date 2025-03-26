import { BaseRenderOptions, EnumOf, SerializedType } from "./rendering.t";

export interface IORenderOptions extends BaseRenderOptions {
  set_default: boolean;
}
export interface IOValueOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: (string | number)[] | EnumOf;
  colorspace?: string;
}

export interface IOType {
  connected: boolean;
  does_trigger: boolean;
  full_id: string;
  id: string;
  is_input: boolean;
  name: string;
  node: string;
  type: SerializedType;
  value: any;
  fullvalue?: any;
  render_options: IORenderOptions;
  value_options?: IOValueOptions;
  valuepreview_type?: string;
  try_get_full_value: undefined | (() => void);
  hidden: boolean;
  set_hidden: undefined | ((v: boolean) => void);
}
