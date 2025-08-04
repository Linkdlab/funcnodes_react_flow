import { object_factory_maker, LimitedDeepPartial } from "@/object-helpers";
import {
  NormalizedSerializedNodeType,
  SerializedIOType,
} from "../serializations";

const dummy_node: NormalizedSerializedNodeType = {
  id: "dummy",
  node_id: "dummy",
  node_name: "dummy",
  properties: {
    "frontend:size": [200, 100],
    "frontend:pos": [NaN, NaN],
    "frontend:collapsed": false,
  },
  io: {},
  io_order: [],
  name: "dummy",
  in_trigger: false,
  reset_inputs_on_trigger: false,
  progress: {
    ascii: false,
    elapsed: 0,
    initial: 0,
    n: 0,
    prefix: "idle",
    unit: "it",
    unit_divisor: 1000,
    unit_scale: false,
  },
};

const dummy_nodeio: SerializedIOType = {
  id: "dummy",
  name: "dummy",
  node: "dummy",
  full_id: "dummy",
  type: "any",
  value: undefined,
  is_input: false,
  connected: false,
  does_trigger: true,
  fullvalue: undefined,
  render_options: {
    set_default: true,
    type: "any",
  },
  hidden: false,
  emit_value_set: true,
  required: false,
};

const default_node_factory: (obj?: LimitedDeepPartial<NormalizedSerializedNodeType>) => NormalizedSerializedNodeType = object_factory_maker(dummy_node);
const default_nodeio_factory: (obj?: LimitedDeepPartial<SerializedIOType>) => SerializedIOType = object_factory_maker(dummy_nodeio);

export { default_node_factory, default_nodeio_factory };
