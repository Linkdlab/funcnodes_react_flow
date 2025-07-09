import { deep_compare_objects, deep_merge } from "../../utils/objects";
import { NodeViewState } from "../fnrfzst.t";

import { UseBoundStore, StoreApi } from "zustand";
import { assertNever, normalize_node, simple_updater } from "./update_funcs";
import { latest } from "../../types/versioned/versions.t";

const update_node = (
  old_store: UseBoundStore<StoreApi<latest.NodeType>>,
  new_state: latest.PartialSerializedNodeType
): void => {
  const old_state = old_store.getState();
  const updatedstate: Partial<latest.NodeType> = {};

  const norm_new_state = normalize_node(new_state);

  const keys = Object.keys(
    norm_new_state
  ) as (keyof latest.SerializedNodeType)[];
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
        old_state[key].setState(!!norm_new_state[key]);
        break;
      }

      case "error": {
        if (norm_new_state[key] !== old_state[key])
          updatedstate[key] = norm_new_state[key];
        break;
      }
      case "render_options": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], norm_new_state[key]);
        if (needs_update)
          updatedstate[key] = newvalue as latest.NodeType[typeof key];

        break;
      }
      case "io_order": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          return [newvalue, !deep_compare_objects(oldvalue, newvalue)];
        })(old_state[key], norm_new_state[key]);
        if (needs_update)
          updatedstate[key] = newvalue as latest.NodeType[typeof key];

        break;
      }
      case "io": {
        const oldvalue = old_state[key];
        const newvalue = norm_new_state[key];
        if (newvalue === undefined) break;
        if (oldvalue === undefined) break;
        for (const iokey in newvalue) {
          if (oldvalue[iokey] === undefined) {
            console.error(
              "io key not found in oldvalue:",
              iokey,
              "allowed:",
              oldvalue,
              "for update:",
              norm_new_state
            );
            continue;
          }
          oldvalue[iokey].update(newvalue[iokey]!);
        }
        break;
      }
      case "progress": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key].getState(), norm_new_state[key]);
        if (needs_update) old_state[key].setState(newvalue);
        break;
      }
      case "description": {
        updatedstate[key] = norm_new_state[key];
        break;
      }
      case "properties": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], norm_new_state[key]);
        if (needs_update)
          updatedstate[key] = newvalue as latest.NodeType[typeof key];

        break;
      }
      case "status": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], norm_new_state[key]);
        if (needs_update)
          updatedstate[key] = newvalue as latest.NodeType[typeof key];
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

const update_nodeview = (
  node: latest.PartialSerializedNodeType,
  view: Partial<NodeViewState>
): void => {
  node.properties = node.properties || {};
  if (view.pos) node.properties["frontend:pos"] = view.pos;
  if (view.size) node.properties["frontend:size"] = view.size;
  if (view.collapsed !== undefined)
    node.properties["frontend:collapsed"] = !!view.collapsed; // convert to boolean
};

export { update_node, update_nodeview };
