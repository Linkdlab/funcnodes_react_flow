import { IOStore, IOType, ValueStoreInterface } from "../interfaces";
import { PartialSerializedIOType, SerializedIOType } from "../serializations";
import { create_json_safe } from "@/zustand-helpers";
import { assert_full_nodeio } from "./full-io";

import { create } from "zustand";
import { DataStructure, JSONStructure } from "@/data-structures";
import { update_io } from "./update";
import { useShallow } from "zustand/react/shallow";

export const createIOStore = (
  node_id: string,
  io: PartialSerializedIOType
): IOStore => {
  let iostore: IOStore;
  const [io_type, value, fullvalue] = assert_full_nodeio(io);
  iostore = {
    io_state: create_json_safe<IOType>((_set, _get) => io_type),
    use: <U>(selector?: (state: IOType) => U): U | IOType => {
      return selector ? iostore.io_state(selector) : iostore.io_state();
    },
    useShallow: <U>(selector: (state: IOType) => U): U => {
      return iostore.io_state(useShallow(selector));
    },
    getState: () => {
      return iostore.io_state.getState();
    },
    setState: (new_state: Partial<IOType>) => {
      iostore.io_state.setState(new_state);
    },
    update: (new_state: PartialSerializedIOType) => {
      update_io(iostore, new_state);
    },
    valuestore: create<ValueStoreInterface>((_set, _get) => {
      let preview = value;
      if (preview === "<NoValue>") {
        preview = undefined;
      }
      if (!(preview instanceof DataStructure) && preview !== undefined) {
        preview = JSONStructure.fromObject(preview);
      }

      let full = fullvalue;
      if (full === "<NoValue>") {
        full = undefined;
      }
      if (!(full instanceof DataStructure) && full !== undefined) {
        full = JSONStructure.fromObject(full);
      }

      return {
        preview: preview,
        full: full,
      };
    }),
    updateValueStore: (newData: Partial<ValueStoreInterface>) => {
      iostore.valuestore.setState((state) => {
        // If the current data has a dispose method, call it
        if (state.preview && typeof state.preview.dispose === "function") {
          state.preview.dispose();
        }
        if (state.full && typeof state.full.dispose === "function") {
          state.full.dispose();
        }

        // if preview is updated but full is not, clear full
        if (newData.preview !== undefined && newData.full === undefined) {
          newData.full = undefined;
          state.full = undefined;
        }

        if (
          newData.preview !== undefined &&
          !(newData.preview instanceof DataStructure)
        ) {
          newData.preview = JSONStructure.fromObject(newData.preview);
        }

        if (
          newData.full !== undefined &&
          !(newData.full instanceof DataStructure)
        ) {
          newData.full = JSONStructure.fromObject(newData.full);
        }

        // Return new state with the updated data
        return { ...state, ...newData };
      });
    },
    node: node_id,
    serialize: () => {
      const state = iostore.io_state.getState();
      const values = iostore.valuestore.getState();
      const serialized_io: SerializedIOType = {
        ...state,
        value: values.preview,
        fullvalue: values.full,
        render_options: state.render_options,
        valuepreview_type: state.valuepreview_type,
        emit_value_set: state.emit_value_set,
      };
      return serialized_io;
    },
  };

  return iostore;
};
