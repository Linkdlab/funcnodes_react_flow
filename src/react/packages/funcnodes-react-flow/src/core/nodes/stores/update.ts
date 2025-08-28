import { IOStore, IOType, NodeType } from "../interfaces";
import {
  PartialSerializedIOType,
  PartialSerializedNodeType,
  SerializedIOType,
  SerializedNodeType,
} from "../serializations";
import { normalize_node } from "./normalization";
import {
  deep_compare_objects,
  simple_updater,
  deep_updater,
  assertNever,
} from "@/object-helpers";
import { IORenderOptions, IOValueOptions } from "../interfaces/io";
import { NodeProperties, NodeStore } from "../interfaces/node";

export const update_node = (
  old_store: NodeStore,
  new_state: PartialSerializedNodeType
): void => {
  const old_state = old_store.getState();
  const updatedstate: Partial<NodeType> = {};
  const norm_new_state = normalize_node(new_state);

  const keys = Object.keys(norm_new_state) as (keyof SerializedNodeType)[];
  for (const key of keys) {
    switch (key) {
      case "id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "node_id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "node_name": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "name": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "in_trigger": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;
        break;
      }

      case "error": {
        if (norm_new_state[key] !== old_state[key])
          updatedstate[key] = norm_new_state[key];
        break;
      }
      case "render_options": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "io_order": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          return [newvalue, !deep_compare_objects(oldvalue, newvalue)];
        })(old_state[key], norm_new_state[key]);
        if (needs_update)
          updatedstate[key] = newvalue.filter((io) => io !== undefined);

        break;
      }
      case "io": {
        const newvalue = norm_new_state[key];
        if (newvalue === undefined) break;
        for (const iokey in newvalue) {
          const oldvalue = old_store.io_stores.get(iokey);
          if (!oldvalue) {
            console.error("io key not found in oldvalue:", iokey);
            continue;
          }
          oldvalue.update(newvalue[iokey]!);
        }
        break;
      }
      case "progress": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;
        break;
      }
      case "description": {
        updatedstate[key] = norm_new_state[key];
        break;
      }
      case "properties": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue as NodeProperties;
        break;
      }
      case "status": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;
        break;
      }
      case "reset_inputs_on_trigger": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          norm_new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;
        break;
      }
      default:
        try {
          assertNever(key, norm_new_state[key]);
        } catch (e) {
          console.error(e);
        }
    }
  }

  // update only if updatedstate is not empty
  if (Object.keys(updatedstate).length > 0) {
    old_store.setState(updatedstate);
  }
};

export const update_io = (
  iostore: IOStore,
  new_state: PartialSerializedIOType
): void => {
  const old_state = iostore.getState();

  const updatedstate: Partial<IOType> = {};
  const newValueStoreState: { preview?: any; full?: any } = {};

  const keys = Object.keys(new_state) as (keyof SerializedIOType)[];
  for (const key of keys) {
    switch (key) {
      case "name": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;
        break;
      }
      case "id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "connected": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }

      case "does_trigger": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "hidden": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "full_id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "is_input": {
        break; // read-only
      }
      case "node": {
        break; // read-only
      }
      case "type": {
        break; // read-only
      }
      case "value": {
        newValueStoreState.preview = new_state[key];
        break;
      }
      case "fullvalue": {
        newValueStoreState.full = new_state[key];
        break;
      }
      case "render_options": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue as IORenderOptions;

        break;
      }
      case "value_options": {
        const [newvalue, needs_update] = deep_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue as IOValueOptions;

        break;
      }
      case "valuepreview_type": {
        updatedstate[key] = new_state[key];
        break;
      }

      case "emit_value_set": {
        updatedstate[key] = new_state[key];
        break;
      }
      case "default": {
        updatedstate[key] = new_state[key];
        break;
      }

      case "required": {
        updatedstate[key] = new_state[key];
        break;
      }

      default:
        try {
          assertNever(key, new_state[key]);
        } catch (e) {
          console.error(e);
        }
    }
  }

  if (Object.keys(newValueStoreState).length > 0) {
    // If there's a preview update but no fullvalue update, clear full.
    iostore.updateValueStore(newValueStoreState);
  }
  if (Object.keys(updatedstate).length > 0) {
    iostore.setState(updatedstate);
  }
};
