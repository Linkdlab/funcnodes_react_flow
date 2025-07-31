import { IOType } from "../interfaces";
import { IOValueType, PartialSerializedIOType } from "../serializations";
import { default_nodeio_factory } from "./default";
import { deserialize_io } from "./deserialization";

export const assert_full_nodeio = (
  io: PartialSerializedIOType
): [IOType, IOValueType, IOValueType] => {
  if (!io.id) {
    throw new Error(
      "IO must have an id but is missing for " + JSON.stringify(io)
    );
  }

  if (io.name === undefined) {
    io.name = io.id;
  }

  const new_obj = default_nodeio_factory(io);

  if (
    new_obj.render_options.type === "any" ||
    new_obj.render_options.type === undefined
  )
    new_obj.render_options.type = new_obj.type;

  return deserialize_io(new_obj);
};
