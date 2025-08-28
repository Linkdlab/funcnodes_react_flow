import { interfereDataStructure } from "@/data-structures";
import { AbstractWorkerHandler } from "./worker-handlers.types";
import { NodeActionUpdate } from "@/funcnodes-context";
import {
  NodeType,
  SerializedNodeType,
  UpdateableIOOptions,
} from "@/nodes-core";

export interface WorkerNodeManagerAPI {
  set_io_value: (params: {
    nid: string;
    ioid: string;
    value: any;
    set_default: boolean;
  }) => any;
  set_io_value_options: (params: {
    nid: string;
    ioid: string;
    values: any[];
    keys: string[];
    nullable: boolean;
  }) => Promise<void>;
  get_io_full_value: (params: { nid: string; ioid: string }) => Promise<any>;
  get_io_value: (params: { nid: string; ioid: string }) => Promise<any>;
  get_ios_values: (params: { nid: string }) => any;
  get_node_status: (nid: string) => any;
  update_io_options: (params: {
    nid: string;
    ioid: string;
    options: UpdateableIOOptions;
  }) => any;
  add_node: (node_id: string) => Promise<NodeType | undefined>;
  remove_node: (node_id: string) => Promise<void>;
  trigger_node: (node_id: string) => Promise<void>;
  locally_update_node: (action: NodeActionUpdate) => void;
  get_remote_node_state: (nid: string) => Promise<void>;
}

export class WorkerNodeManager
  extends AbstractWorkerHandler
  implements WorkerNodeManagerAPI
{
  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }

  async trigger_node(node_id: string) {
    await this.communicationManager._send_cmd({
      cmd: "trigger_node",
      kwargs: { nid: node_id },
      wait_for_response: false,
    });
  }

  async add_node(node_id: string) {
    const resp = await this.communicationManager._send_cmd({
      cmd: "add_node",
      kwargs: { id: node_id },
    });
    return this.eventManager._receive_node_added(resp as SerializedNodeType);
  }

  async remove_node(node_id: string) {
    await this.communicationManager._send_cmd({
      cmd: "remove_node",
      kwargs: { id: node_id },
    });
  }

  locally_update_node(action: NodeActionUpdate) {
    this.syncManager.locally_update_node(action);
  }

  set_io_value({
    nid,
    ioid,
    value,
    set_default = false,
  }: {
    nid: string;
    ioid: string;
    value: any;
    set_default: boolean;
  }) {
    return this.communicationManager._send_cmd({
      cmd: "set_io_value",
      kwargs: { nid, ioid, value, set_default },
      wait_for_response: true,
    });
  }

  set_io_value_options({
    nid,
    ioid,
    values,
    keys,
    nullable,
  }: {
    nid: string;
    ioid: string;
    values: any[];
    keys: string[];
    nullable: boolean;
  }) {
    return this.communicationManager._send_cmd({
      cmd: "update_io_value_options",
      kwargs: {
        nid,
        ioid,
        options: {
          options: {
            type: "enum",
            values: values,
            keys: keys,
            nullable: nullable,
          },
        },
      },
    });
  }

  async get_io_value({ nid, ioid }: { nid: string; ioid: string }) {
    const res = await this.communicationManager._send_cmd({
      cmd: "get_io_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
    });

    if (!this.context.worker._zustand) return res;
    this.context.worker._zustand.on_node_action({
      type: "update",
      node: {
        io: {
          [ioid]: {
            value: res,
          },
        },
      },
      id: nid,
      from_remote: true,
    });
    return res;
  }

  async get_ios_values({ nid }: { nid: string }) {
    const res: { [ioid: string]: any } =
      await this.communicationManager._send_cmd({
        cmd: "get_ios_values",
        kwargs: { nid },
        wait_for_response: true,
      });

    if (!this.context.worker._zustand) return res;

    const mappedres: { [ioid: string]: { value: any } } = {};
    for (const ioid in res) {
      mappedres[ioid] = { value: res[ioid] };
    }

    this.context.worker._zustand.on_node_action({
      type: "update",
      node: {
        io: mappedres,
      },
      id: nid,
      from_remote: true,
    });
    return res;
  }

  async get_io_full_value({ nid, ioid }: { nid: string; ioid: string }) {
    const res = await this.communicationManager._send_cmd({
      cmd: "get_io_full_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
      as_bytes: true,
    });

    const { header, bytes } = res;

    const { mime } = header;
    const ds = interfereDataStructure({
      data: bytes,
      mime: mime || "application/octet-stream",
    });

    this.context.worker._zustand?.on_node_action?.({
      type: "update",
      node: {
        id: nid,
        io: {
          [ioid]: {
            fullvalue: ds,
          },
        },
      },
      id: nid,
      from_remote: true,
    });

    return ds;
  }

  async update_io_options({
    nid,
    ioid,
    options,
  }: {
    nid: string;
    ioid: string;
    options: UpdateableIOOptions;
  }) {
    const res = await this.communicationManager._send_cmd({
      cmd: "update_io_options",
      kwargs: { nid, ioid, ...options },
      wait_for_response: true,
    });

    if (!this.context.worker._zustand) return res;
    this.context.worker._zustand.on_node_action({
      type: "update",
      node: {
        io: {
          [ioid]: {
            ...options,
          },
        },
      },
      id: nid,
      from_remote: true,
    });
  }

  async get_node_status(nid: string) {
    const res = await this.communicationManager._send_cmd({
      cmd: "get_node_state",
      kwargs: { nid },
      wait_for_response: true,
    });
    return res;
  }

  async get_remote_node_state(nid: string) {
    const ans: SerializedNodeType = await this.communicationManager._send_cmd({
      cmd: "get_node_state",
      kwargs: { nid },
      wait_for_response: true,
    });
    if (!this.context.worker._zustand) return;
    this.context.worker._zustand.on_node_action({
      type: "update",
      node: ans,
      id: ans.id,
      from_remote: true,
    });
  }
}

export class WorkerNodeManagerAPIMixin {}
