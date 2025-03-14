import { deep_compare_objects, deep_merge } from "../../utils/objects";
import { NodeViewState } from "../fnrfzst.t";
import {
  NodeType,
  PartialSerializedNodeType,
  SerializedNodeType,
} from "../node.t";
import { UseBoundStore, StoreApi } from "zustand";
import { assertNever, simple_updater } from "./update_funcs";

const update_node = (
  old_store: UseBoundStore<StoreApi<NodeType>>,
  new_state: PartialSerializedNodeType
): void => {
  const old_state = old_store.getState();
  const updatedstate: Partial<NodeType> = {};

  const keys = Object.keys(new_state) as (keyof SerializedNodeType)[];
  for (const key of keys) {
    switch (key) {
      case "id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "node_id": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "node_name": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "name": {
        const [newvalue, needs_update] = simple_updater(
          old_state[key],
          new_state[key]
        );
        if (needs_update) updatedstate[key] = newvalue;

        break;
      }
      case "in_trigger": {
        old_state[key].setState(!!new_state[key]);
        break;
      }

      case "error": {
        if (new_state[key] !== old_state[key])
          updatedstate[key] = new_state[key];
        break;
      }
      case "render_options": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as NodeType[typeof key];

        break;
      }
      case "io_order": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          return [newvalue, !deep_compare_objects(oldvalue, newvalue)];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as NodeType[typeof key];

        break;
      }
      case "io": {
        const oldvalue = old_state[key];
        const newvalue = new_state[key];
        if (newvalue === undefined) break;
        for (const key in oldvalue) {
          if (newvalue[key] === undefined) continue;
          oldvalue[key].update(newvalue[key]);
        }
        break;
      }
      case "progress": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key].getState(), new_state[key]);
        if (needs_update) old_state[key].setState(newvalue);
        break;
      }
      case "description": {
        updatedstate[key] = new_state[key];
        break;
      }
      case "properties": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as NodeType[typeof key];

        break;
      }
      case "status": {
        const [newvalue, needs_update] = ((oldvalue, newvalue) => {
          if (newvalue === undefined) return [oldvalue, false];
          if (oldvalue === undefined) return [newvalue, newvalue !== undefined];
          const { new_obj, change } = deep_merge(oldvalue, newvalue);
          return [new_obj, change];
        })(old_state[key], new_state[key]);
        if (needs_update) updatedstate[key] = newvalue as NodeType[typeof key];
        break;
      }
      default:
        assertNever(key, new_state[key]);
    }
  }

  // update only if updatedstate is not empty
  if (Object.keys(updatedstate).length > 0) {
    console.log("NODEUPDATE:", updatedstate);
    old_store.setState(updatedstate);
  }
};

const update_nodeview = (
  node: PartialSerializedNodeType,
  view: Partial<NodeViewState>
): void => {
  node.properties = node.properties || {};
  if (view.pos) node.properties["frontend:pos"] = view.pos;
  if (view.size) node.properties["frontend:size"] = view.size;
  if (view.collapsed !== undefined)
    node.properties["frontend:collapsed"] = !!view.collapsed; // convert to boolean
};

export { update_node, update_nodeview };
