import { DeepPartial, LimitedDeepPartial } from "@/object-helpers";

import { DataStructure } from "@/data-structures";
import { TqdmState } from "@/shared-components";
import { BasicIOType } from "../interfaces/io";
import { BasicNodeType } from "../interfaces/node";

export type IOValueType =
  | string
  | number
  | boolean
  | undefined
  | DataStructure<any, any>;

export interface SerializedIOType extends BasicIOType {
  value: IOValueType;
  fullvalue: IOValueType;
}

export type SerializedNodeIOMappingType = {
  [key: string]: SerializedIOType | undefined;
};

export interface SerializedNodeType extends BasicNodeType {
  in_trigger: boolean;
  io: SerializedNodeIOMappingType | SerializedIOType[];
  io_order?: string[];
  progress: DeepPartial<TqdmState>;
}

export interface NormalizedSerializedNodeType
  extends Omit<SerializedNodeType, "io"> {
  io_order: string[];
  io: { [key: string]: LimitedDeepPartial<SerializedIOType> };
}

export type PartialNormalizedSerializedNodeType =
  LimitedDeepPartial<NormalizedSerializedNodeType>;

export type PartialSerializedNodeType = LimitedDeepPartial<SerializedNodeType>;
export type PartialSerializedIOType = LimitedDeepPartial<SerializedIOType>;

export type {
  SerializedType,
  AllOf,
  AnyOf,
  ArrayOf,
  DictOf,
  EnumOf,
  TypeOf,
} from "./types";
