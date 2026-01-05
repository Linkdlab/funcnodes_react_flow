import { CmdMessage, JSONMessage } from "@/messages";
import {
  AbstractWorkerHandler,
  WorkerHandlerContext,
} from "./worker-handlers.types";
import { v4 as uuidv4 } from "uuid";
import { interfereDataStructure } from "@/data-structures";

export class WorkerCommunicationManager extends AbstractWorkerHandler {
  private CHUNK_TIMEOUT: number = 10000; // 10 seconds
  private _unique_cmd_outs: { [key: string]: Promise<any> | undefined } = {};
  private messagePromises: Map<string, any>;
  private _chunk_cleanup_timer: ReturnType<typeof setTimeout> | undefined;
  private blobChunks: {
    [key: string]: { chunks: (Uint8Array | null)[]; timestamp: number };
  } = {};
  constructor(context: WorkerHandlerContext) {
    super(context);
    this.messagePromises = new Map();
  }
  private cleanupChunks = () => {
    const now = Date.now();
    for (const id in this.blobChunks) {
      if (now - this.blobChunks[id].timestamp > this.CHUNK_TIMEOUT) {
        delete this.blobChunks[id];
      }
    }
  };
  public start(): void {
    this._chunk_cleanup_timer = setInterval(
      this.cleanupChunks.bind(this),
      this.CHUNK_TIMEOUT / 2
    );
  }

  public stop(): void {
    if (this._chunk_cleanup_timer) clearInterval(this._chunk_cleanup_timer);
  }

  send(data: any) {
    this.context.worker.send(data);
  }

  async _send_cmd({
    cmd,
    kwargs,
    as_bytes = false,
    wait_for_response = true,
    response_timeout = 5000,
    retries = 2,
    unique = false,
  }: {
    cmd: string;
    kwargs?: any;
    wait_for_response?: boolean;
    response_timeout?: number;
    as_bytes?: boolean;
    retries?: number;
    unique?: boolean;
  }) {
    const msg: CmdMessage = {
      type: "cmd",
      as_bytes: as_bytes,
      cmd,
      kwargs: kwargs || {},
    };

    await new Promise<void>(async (resolve) => {
      if (this.context.worker.is_responsive) return resolve();
      const interval = setInterval(() => {
        if (this.context.worker.is_responsive) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    if (wait_for_response) {
      if (unique && this._unique_cmd_outs[msg.cmd] !== undefined) {
        return this._unique_cmd_outs[msg.cmd];
      }
      if (retries < 0) retries = 0;
      const wait_for_response_callback = async (): Promise<any> => {
        let response;
        while (retries >= 0) {
          const msg_id = msg.id || uuidv4();
          msg.id = msg_id;
          const promise = new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject("Timeout@wait_for_response for " + cmd);
            }, response_timeout);
            this.messagePromises.set(msg_id, {
              resolve: (data: any) => {
                clearTimeout(timeout);
                resolve(data);
                this.messagePromises.delete(msg_id);
              },
              reject: (err: any) => {
                clearTimeout(timeout);
                reject(err);
                this.messagePromises.delete(msg_id);
              },
            });
          });
          await this.send(msg);
          try {
            response = await promise;
            break;
          } catch (e) {
            if (retries === 0) {
              delete this._unique_cmd_outs[msg.cmd];
              throw e;
            }
            retries -= 1;
            continue;
          }
        }
        delete this._unique_cmd_outs[msg.cmd];

        return response;
      };

      const awaiter = wait_for_response_callback();

      if (unique) this._unique_cmd_outs[msg.cmd] = awaiter;

      return awaiter;
    }
    return this.send(msg);
  }

  async receive(data: JSONMessage) {
    let promise;
    // any message is a sign of life:
    this.connectionHealthManager.receivePong();
    switch (data.type) {
      case "pong":
        return this.connectionHealthManager.receivePong();
      case "nsevent":
        return await this.context.worker
          .getEventManager()
          .receive_nodespace_event(data);
      case "result":
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.resolve(data.result);
        }
        break;
      case "error":
        this.context.worker.on_error(data.tb + "\n" + data.error);
        promise = data.id && this.messagePromises.get(data.id);
        if (promise) {
          return promise.reject(data.error);
        }
        break;
      case "progress":
        if (!this.context.worker._zustand) return;
        this.context.worker._zustand.set_progress(data);
        break;

      case "workerevent":
        return await this.context.worker
          .getEventManager()
          .receive_workerevent(data);

      case "large_message":
        return await this.context.worker.handle_large_message_hint(data);
      default:
        console.warn("Unhandled message", data);
        break;
    }
  }

  async receive_bytes(
    headerObj: { [key: string]: string | undefined },
    bytes: Uint8Array
  ) {
    const { type } = headerObj;

    if (type === "io_value") {
      if (!this.context.worker._zustand) return;
      const { node, io, preview, mime } = headerObj;
      const valuekey = preview ? "value" : "fullvalue";
      if (!node || !io) console.error("Invalid io_value message", headerObj);
      const ds = interfereDataStructure({
        data: bytes,
        mime: mime || "application/octet-stream",
      });
      // console.log("Received bytes", "Header:", headerObj, "Datastructure:", ds);
      this.context.worker._zustand.on_node_action({
        type: "update",
        node: {
          id: node!,
          io: {
            [io!]: {
              [valuekey]: ds,
            },
          },
        },
        id: node!,
        from_remote: true,
      });
    } else if (type == "result") {
      const promise = headerObj.id && this.messagePromises.get(headerObj.id);
      if (promise) {
        promise.resolve({ bytes, header: headerObj });
      }
    } else {
      console.warn("Unhandled bytes message", headerObj);
    }
  }

  async onbytes(data: Uint8Array) {
    try {
      const headerStr = new TextDecoder("utf-8").decode(data);

      const headerEndIndex = headerStr.indexOf("\r\n\r\n");
      if (headerEndIndex === -1) {
        console.error("Header terminator not found for:\n", headerStr);
        return;
      }
      const header = headerStr.substring(0, headerEndIndex + 4);
      const bytes_wo_header = data.slice(headerEndIndex + 4);
      //header are key value pairs in the form of k1=v1;k2=v2; k3=v3; ...
      const headerArr = header.split(";");
      const headerObj: { [key: string]: string } = {};
      headerArr.forEach((h) => {
        const [key, value] = h.split("=");
        headerObj[key.trim()] = value.trim();
      });

      //make sure the header has the required fields
      //chunk=1/1;msgid=1d156acd-772f-400c-b023-09111e8643ea;type=io_value; mime=application/json; node=fcc5c2878500436aad0343854db51ac1; io=imagedata
      if (!headerObj.chunk || !headerObj.msgid) {
        console.error(
          "Header missing required fields chunk or msgid",
          headerObj
        );
        return;
      }

      const [chunk, total] = headerObj.chunk.split("/");
      const msgid = headerObj.msgid;

      //if chunk is 1/1, then this is the only chunk
      if (chunk === "1" && total === "1") {
        return this.receive_bytes(headerObj, bytes_wo_header);
      }

      if (!this.blobChunks[msgid]) {
        this.blobChunks[msgid] = {
          chunks: Array.from({ length: parseInt(total) }, () => null),
          timestamp: Date.now(),
        };
      }

      if (this.blobChunks[msgid].chunks.length !== parseInt(total)) {
        console.error("Total chunks mismatch");
        return;
      }

      this.blobChunks[msgid].chunks[parseInt(chunk) - 1] = data;

      //check if all chunks are received
      if (this.blobChunks[msgid].chunks.every((c) => c !== null)) {
        const fullBytes = new Uint8Array(
          this.blobChunks[msgid].chunks.reduce((acc, chunk) => {
            return acc.concat(Array.from(chunk));
          }, [] as number[])
        );
        this.receive_bytes(headerObj, fullBytes);
        delete this.blobChunks[msgid];
      }
    } catch (e) {
      console.error("Websocketworker: onbytes error", e, data);
      return;
    }
  }
}
