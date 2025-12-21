import { IOType } from "@/nodes-core";
import { useWorkerApi } from "@/workers";
import * as React from "react";
import { useIOStore } from "../provider";
import { ValueStoreInterface } from "@/nodes-core";

export function useSetIOValue(): (value: any, set_default?: boolean) => void;
export function useSetIOValue(
  io: string
): (value: any, set_default?: boolean) => void;
export function useSetIOValue(
  io: IOType
): (value: any, set_default?: boolean) => void;
export function useSetIOValue(io?: IOType | string | undefined) {
  const { node } = useWorkerApi();
  if (!io) {
    const iostore = useIOStore();
    io = iostore.use();
  }
  if (typeof io === "string") {
    const iostore = useIOStore(io);
    io = iostore?.use();
    if (!io) {
      throw new Error(`No IO found for ${io}`);
    }
  }
  if (!io) {
    throw new Error("No IO found");
  }

  const func = React.useCallback(
    (value: any, set_default?: boolean) => {
      node?.set_io_value({
        nid: io.node,
        ioid: io.id,
        value: value,
        set_default:
          set_default == undefined
            ? io.render_options.set_default
            : set_default,
      });
    },
    [io, node]
  );

  return func;
}

type IOValueOptionsSetter = (data: {
  values?: any[];
  keys: string[];
  nullable?: boolean;
}) => void;

export function useSetIOValueOptions(): IOValueOptionsSetter;
export function useSetIOValueOptions(io: string): IOValueOptionsSetter;
export function useSetIOValueOptions(io: IOType): IOValueOptionsSetter;
export function useSetIOValueOptions(
  io?: IOType | string | undefined
): IOValueOptionsSetter {
  const { node: node_api } = useWorkerApi();
  let io_id: string;
  let node_id: string;
  if (!io) {
    const iostore = useIOStore();
    const ios = iostore.useShallow((state) => {
      return {
        io_id: state.id,
        node_id: state.node,
      };
    });
    io_id = ios.io_id;
    node_id = ios.node_id;
  }
  if (typeof io === "string") {
    const iostore = useIOStore(io);
    if (!iostore) {
      throw new Error(`No IO found for ${io}`);
    }
    const ios = iostore.useShallow((state) => {
      return {
        io_id: state.id,
        node_id: state.node,
      };
    });
    io_id = ios.io_id;
    node_id = ios.node_id;
  } else {
    if (!io) {
      throw new Error("No IO found");
    }
    io_id = io.id;
    node_id = io.node;
  }

  const func = React.useCallback(
    (data: { values?: any[]; keys: string[]; nullable?: boolean }) => {
      node_api?.set_io_value_options({
        nid: node_id,
        ioid: io_id,
        values: data.values ?? data.keys,
        keys: data.keys,
        nullable: data.nullable ?? false,
      });
    },
    [node_api, io_id, node_id]
  );

  return func;
}

export function useIOValueStore(): ValueStoreInterface;
export function useIOValueStore(io: string): ValueStoreInterface | undefined;
export function useIOValueStore(
  io: string | undefined
): ValueStoreInterface | undefined;
export function useIOValueStore(io?: string) {
  const iostore = useIOStore(io);

  return iostore?.valuestore();
}

type IOGetFullValue = () => Promise<any> | undefined;
export function useIOGetFullValue(): IOGetFullValue | undefined;
export function useIOGetFullValue(io: string): IOGetFullValue | undefined;
export function useIOGetFullValue(
  io: string | undefined
): IOGetFullValue | undefined;
export function useIOGetFullValue(io?: string | undefined) {
  const iostore = useIOStore(io);
  if (!iostore) return undefined;

  const { node: nid, id: ioid } = iostore.useShallow((state) => ({
    node: state.node,
    id: state.id,
  }));
  const { node } = useWorkerApi();
  const func = React.useCallback(async () => {
    const val = await node?.get_io_full_value({ nid: nid, ioid: ioid });
    iostore.updateValueStore({ full: val });
    return val;
  }, [node, nid, ioid]);
  return func;
}

type IOSetHidden = (v: boolean) => Promise<void> | undefined;
export function useIOSetHidden(): IOSetHidden | undefined;
export function useIOSetHidden(io: string): IOSetHidden | undefined;
export function useIOSetHidden(io: string | undefined): IOSetHidden | undefined;
export function useIOSetHidden(io?: string | undefined) {
  const iostore = useIOStore(io);
  if (!iostore) return undefined;

  const { node: nid, id: ioid } = iostore.useShallow((state) => ({
    node: state.node,
    id: state.id,
  }));
  const { node } = useWorkerApi();

  const func = React.useCallback(
    (v: boolean) => {
      node?.update_io_options({
        nid: nid,
        ioid: ioid,
        options: { hidden: v },
      });
    },
    [node, nid, ioid]
  );
  return func;
}
