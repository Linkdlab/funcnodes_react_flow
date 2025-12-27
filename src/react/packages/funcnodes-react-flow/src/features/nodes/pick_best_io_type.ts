import type { IOType, RenderType } from "@/nodes-core";
import type { DeepPartial } from "@/object-helpers";

type TypeMap = { [key: string]: string | undefined };

const _inner_pick_best_io_type = (
  iot: DeepPartial<RenderType>,
  typemap: TypeMap
): [string | undefined, string | undefined] => {
  // check if iot is string
  if (typeof iot === "string") {
    if (iot in typemap) {
      return [typemap[iot], iot];
    }
    return [iot, iot];
  }
  if ("allOf" in iot && iot.allOf !== undefined) {
    return [undefined, undefined];
  }
  if ("anyOf" in iot && iot.anyOf !== undefined) {
    const picks = iot.anyOf.map((x) =>
      _inner_pick_best_io_type(x || "any", typemap)
    );
    for (const pick of picks) {
      switch (pick[0]) {
        case "bool":
          return ["bool", pick[1]];
        case "enum":
          return ["enum", pick[1]];
        case "float":
          return ["float", pick[1]];
        case "int":
          return ["int", pick[1]];
        case "string":
          return ["string", pick[1]];
        case "str":
          return ["string", pick[1]];
      }
    }

    return [undefined, undefined];
  }
  if (!("type" in iot) || iot.type === undefined) {
    return [undefined, undefined];
  }

  if (iot.type === "enum") {
    return ["enum", "enum"];
  }
  return [undefined, undefined];
};

export const pick_best_io_type = (
  io: IOType,
  typemap: TypeMap
): [string | undefined, string | undefined] => {
  return _inner_pick_best_io_type(io.render_options?.type ?? "any", typemap);
};
