import {
  IOStore,
  IOType,
  PartialSerializedIOType,
  SerializedIOType,
} from "../nodeio.t";
import { assertNever, simple_updater } from "./update_funcs";
import { deep_merge } from "../../utils/objects";
const update_io = (
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
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as IOType[typeof key];

        break;
      }
      case "value_options": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as IOType[typeof key];

        break;
      }
      case "valuepreview_type": {
        updatedstate[key] = new_state[key];
        break;
      }

      default:
        assertNever(key, new_state[key]);
    }
  }

  if (Object.keys(newValueStoreState).length > 0) {
    // If there's a preview update but no fullvalue update, clear full.
    if (
      newValueStoreState.preview !== undefined &&
      newValueStoreState.full === undefined
    ) {
      newValueStoreState.full = undefined;
    }
    iostore.valuestore.setState(newValueStoreState);
  }
  if (Object.keys(updatedstate).length > 0) {
    console.log("IO UPDATE:", updatedstate);
    iostore.setState(updatedstate);
  }
};

export { update_io };
