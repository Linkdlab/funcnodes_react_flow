import { v4 as uuidv4 } from "uuid";
import {
  FullState,
  FuncNodesReactFlowZustandInterface,
  JSONMessage,
  NodeSpaceEvent,
} from "../states/fnrfzst.t";
import { NodeActionUpdate, NodeType, PartialNodeType } from "../states/node.t"; // Import the missing type
import { deep_merge } from "../utils";
type CmdMessage = {
  type: string;
  cmd: string;
  kwargs: any;
  id?: string;
};

interface WorkerProps {
  zustand: FuncNodesReactFlowZustandInterface;
  uuid: string;
  on_error?: (error: string | Error) => void;
}

class FuncNodesWorker {
  messagePromises: Map<string, any>;
  _zustand: FuncNodesReactFlowZustandInterface;
  _nodeupdates: Map<string, PartialNodeType>;
  _nodeupdatetimer: NodeJS.Timeout;
  uuid: string;
  is_open: boolean;
  on_error: (error: any) => void;
  constructor(data: WorkerProps) {
    this.uuid = data.uuid;
    this.on_error = data.on_error || console.error;
    this.messagePromises = new Map();
    this._zustand = data.zustand;
    this._nodeupdates = new Map();
    this._nodeupdatetimer = setTimeout(() => {
      this.perform_update();
    }, 1000);
    this.is_open = true;
  }
  async fullsync() {
    const resp = (await this._send_cmd({ cmd: "full_state" })) as FullState;
    console.log("Full state", resp);
    this._zustand.lib.libstate.getState().set(resp.backend.lib);
    if (resp.view.renderoptions)
      this._zustand.update_render_options(resp.view.renderoptions);
    const nodeview = resp.view.nodes;
    for (const node of resp.backend.nodes) {
      if (nodeview[node.id] !== undefined) {
        node.frontend = nodeview[node.id];
      }
      this._recieve_node_added(node);
    }
    for (const edge of resp.backend.edges) {
      this._recieve_edge_added(...edge);
    }
  }

  async _recieve_edge_added(
    src_nid: string,
    src_ioid: string,
    trg_nid: string,
    trg_ioid: string
  ) {
    this._zustand.on_edge_action({
      type: "add",
      from_remote: true,
      ...{ src_nid, src_ioid, trg_nid, trg_ioid },
    });
  }

  async trigger_node(node_id: string) {
    await this._send_cmd({
      cmd: "trigger_node",
      kwargs: { nid: node_id },
      wait_for_response: false,
    });
  }

  async add_node(node_id: string) {
    const resp = await this._send_cmd({
      cmd: "add_node",
      kwargs: { id: node_id },
    });
    this._recieve_node_added(resp as NodeType);
  }

  async remove_node(node_id: string) {
    const resp = await this._send_cmd({
      cmd: "remove_node",
      kwargs: { id: node_id },
    });
  }

  async _recieve_node_added(data: NodeType) {
    this._zustand.on_node_action({
      type: "add",
      node: data,
      id: data.id,
      from_remote: true,
    });
  }

  add_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
    replace = false,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
    replace?: boolean;
  }) {
    return this._send_cmd({
      cmd: "add_edge",
      kwargs: { src_nid, src_ioid, trg_nid, trg_ioid, replace },
    });
  }

  remove_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
  }) {
    return this._send_cmd({
      cmd: "remove_edge",
      kwargs: { src_nid, src_ioid, trg_nid, trg_ioid },
    });
  }

  perform_update() {
    clearTimeout(this._nodeupdatetimer);
    this._nodeupdates.forEach(async (node, id) => {
      const ans = await this._send_cmd({
        cmd: "update_node",
        kwargs: { nid: id, data: node },
        wait_for_response: true,
      });
      this._zustand.on_node_action({
        type: "update",
        node: ans,
        id: id,
        from_remote: true,
      });
    });
    this._nodeupdates.clear();
    this._nodeupdatetimer = setTimeout(() => {
      this.perform_update();
    }, 1000);
  }

  update_node(action: NodeActionUpdate) {
    // Add the type to the parameter
    const currentstate = this._nodeupdates.get(action.id);
    if (currentstate) {
      const { new_obj, change } = deep_merge(currentstate, action.node);
      if (change) {
        this._nodeupdates.set(action.id, new_obj);
      }
    } else {
      this._nodeupdates.set(action.id, action.node);
    }
    if (action.immediate) {
      this.perform_update();
    }
  }

  set_io_value({
    nid,
    ioid,
    value,
    set_default,
  }: {
    nid: string;
    ioid: string;
    value: any;
    set_default?: boolean;
  }) {
    return this._send_cmd({
      cmd: "set_io_value",
      kwargs: { nid, ioid, value, set_default },
      wait_for_response: true,
    });
  }

  clear() {
    return this._send_cmd({ cmd: "clear" });
  }

  save() {
    return this._send_cmd({ cmd: "save", wait_for_response: true });
  }

  load(data: any) {
    return this._send_cmd({
      cmd: "load_data",
      kwargs: { data },
      wait_for_response: true,
    }).then(() => {
      this.fullsync();
    });
  }

  get_io_value({ nid, ioid }: { nid: string; ioid: string }) {
    return this._send_cmd({
      cmd: "get_io_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
    });
  }

  async _send_cmd({
    cmd,
    kwargs,
    wait_for_response = true,
    response_timeout = 5000,
  }: {
    cmd: string;
    kwargs?: any;
    wait_for_response?: boolean;
    response_timeout?: number;
  }) {
    const msg: CmdMessage = {
      type: "cmd",
      cmd,
      kwargs: kwargs || {},
    };

    // await self.assert_connection()
    if (wait_for_response) {
      const msid = msg.id || uuidv4();
      msg.id = msid;
      const promise = new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject("Timeout");
        }, response_timeout);
        this.messagePromises.set(msid, {
          resolve: (data: any) => {
            clearTimeout(timeout);
            resolve(data);
            this.messagePromises.delete(msid);
          },
          reject: (err: any) => {
            clearTimeout(timeout);
            reject(err);
            this.messagePromises.delete(msid);
          },
        });
      });
      await this.send(msg);
      return promise;
    }
    return this.send(msg);
  }

  async send(data: any) {
    // this is the abstract method that should be implemented by subclasses
    throw new Error("Not implemented");
  }

  async recieve_nodespace_event({ event, data }: NodeSpaceEvent) {
    switch (event) {
      case "after_set_value":
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            io: {
              [data.io]: {
                value: data.result,
              },
            },
          },
          id: data.node,
          from_remote: true,
        });
      case "after_update_value_options":
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            io: {
              [data.io]: {
                value_options: data.result,
              },
            },
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerstart":
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: true,
          },
          id: data.node,
          from_remote: true,
        });

      case "triggerdone":
        return this._zustand.on_node_action({
          type: "update",
          node: {
            id: data.node,
            in_trigger: false,
          },
          id: data.node,
          from_remote: true,
        });

      case "node_trigger_error":
        return this._zustand.on_node_action({
          type: "error",
          errortype: "trigger",
          error: data.error,
          id: data.node,
          from_remote: true,
        });

      case "node_removed":
        return this._zustand.on_node_action({
          type: "delete",
          id: data.node,
          from_remote: true,
        });

      case "node_added":
        return this._recieve_node_added(data.node as NodeType);

      case "after_disconnect":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        return this._zustand.on_edge_action({
          type: "delete",
          from_remote: true,
          src_nid: data.result[0],
          src_ioid: data.result[1],
          trg_nid: data.result[2],
          trg_ioid: data.result[3],
        });

      case "after_connect":
        if (!data.result) return;
        if (!Array.isArray(data.result)) return;
        if (data.result.length !== 4) return;
        return this._recieve_edge_added(
          ...(data.result as [string, string, string, string])
        );

      case "after_add_shelf":
        if (!data.result) return;
        return this._zustand.lib.libstate.getState().set(data.result);

      default:
        console.warn("Unhandled nodepsace event", event, data);
        break;
    }
  }

  async add_lib(lib: string) {
    const ans = await this._send_cmd({
      cmd: "add_shelf",
      kwargs: { src: lib },
      wait_for_response: false,
    });
    return ans;
  }

  async recieve(data: JSONMessage) {
    let promise;
    switch (data.type) {
      case "nsevent":
        return await this.recieve_nodespace_event(data);
      case "result":
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.resolve(data.result);
        }
        break;
      case "error":
        this.on_error(data.tb + "\n" + data.error);
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.reject(data.error);
        }
        break;
      case "progress":
        this._zustand.set_progress(data);
        break;
      default:
        console.warn("Unhandled message", data);
        break;
    }
  }

  disconnect() {}

  onclose() {
    this.is_open = false;
    this._zustand.auto_progress();
  }

  async reconnect() {}

  async stop() {
    await this._send_cmd({ cmd: "stop_worker", wait_for_response: false });
    const oldonclose = this.onclose.bind(this);
    this.onclose = () => {
      oldonclose();
      if (this._zustand.worker === this) {
        this._zustand.clear_all();
      }
      this.onclose = oldonclose;
    };
  }

  async get_io_full_value({ nid, ioid }: { nid: string; ioid: string }) {
    const res = await this._send_cmd({
      cmd: "get_io_full_value",
      kwargs: { nid, ioid },
      wait_for_response: true,
    });
    //console.log("Full value", res);

    this._zustand.on_node_action({
      type: "update",
      node: {
        io: {
          [ioid]: {
            fullvalue: res,
          },
        },
      },
      id: nid,
      from_remote: true,
    });
    return res;
  }
}

export default FuncNodesWorker;
export type { WorkerProps };
