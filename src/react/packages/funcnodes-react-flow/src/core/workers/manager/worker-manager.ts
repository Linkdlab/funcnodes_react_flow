import { FuncNodesReactFlow } from "@/funcnodes-context";
import { ProgressStateMessage } from "@/messages";
import { FuncNodesWorker, WebSocketWorker, WorkersState } from "@/workers";

export class WorkerManager {
  private _wsuri: string;
  private workers: { [key: string]: FuncNodesWorker };
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 999;
  private initialTimeout: number = 200; // Initial reconnect delay in ms
  private maxTimeout: number = 2000; // Maximum reconnect delay
  private zustand: FuncNodesReactFlow;
  private connectionTimeout?: ReturnType<typeof setTimeout>;
  on_setWorker: (worker: FuncNodesWorker | undefined) => void;
  constructor(wsuri: string, zustand: FuncNodesReactFlow) {
    zustand.logger.debug("Initializing worker manager");
    this._wsuri = wsuri;
    this.zustand = zustand;
    this.workers = {};
    this.on_setWorker = (worker: FuncNodesWorker | undefined) => {
      this.zustand.set_worker(worker);
    };

    // conect after a short delay to allow the zustand store to be initialized
    this.connectionTimeout = setTimeout(() => {
      this.connect();
    }, 200);
  }

  get wsuri() {
    return this._wsuri;
  }

  get open() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private connect(): void {
    this.zustand.set_progress({
      progress: 0,
      message: "connecting to worker manager",
      status: "info",
      blocking: true,
    });
    this.zustand.logger.info("Connecting to websocket:", this._wsuri);
    this.ws = new WebSocket(this._wsuri);

    this.ws.onopen = () => {
      this.onopen();
    };

    this.ws.onclose = () => {
      this.onclose();
    };

    this.ws.onerror = () => {
      this.on_ws_error();
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.onmessage(event.data);
      } else {
        console.error(
          "WorkerManager: onmessage event.data is not a string",
          typeof event.data
        );
      }
    };

    this.connectionTimeout = setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.on_ws_error();
      }
    }, 5000);
  }

  on_ws_error() {
    console.warn("Websocket error");
    if (this.ws) {
      this.ws.close(); // Ensure the connection is closed before attempting to reconnect
    } else {
      this.reconnect();
    }
  }

  onopen() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = undefined;
    }
    this.zustand.auto_progress();

    if (this.ws) {
      this.ws.send("worker_status");
    }

    // Get active worker from window storage
  }
  onmessage(event: string) {
    try {
      let msg = JSON.parse(event);

      if (msg.type === "worker_status") {
        const new_state: WorkersState = {};
        for (let worker of msg.active) {
          worker.active = true;
          new_state[worker.uuid] = worker;
        }
        for (let worker of msg.inactive) {
          worker.active = false;
          new_state[worker.uuid] = worker;
        }
        this.zustand.workers.setState(new_state);

        if (!this.zustand.worker) {
          const active_worker = window.localStorage.getItem(
            "funcnodes__active_worker"
          );
          if (
            active_worker &&
            new_state[active_worker] &&
            new_state[active_worker].active
          ) {
            this.set_active(active_worker);
          }
        }

        return;
      } else if (msg.type === "set_worker") {
        if (msg.data.type === "WSWorker") {
          let url =
            "ws" +
            (msg.data.ssl ? "s" : "") +
            "://" +
            msg.data.host +
            ":" +
            msg.data.port;

          this.setWorker(
            this.workers[msg.data.uuid] ||
              new WebSocketWorker({
                url,
                zustand: this.zustand,
                uuid: msg.data.uuid,
                on_sync_complete: this.zustand.options.on_sync_complete,
              })
          );
        } else {
          this.zustand.logger.error("WorkerManager: unknown worker type", msg);
        }

        //store active worker in window storage

        return;
      } else if (msg.type === "progress") {
        this.zustand.set_progress(msg as ProgressStateMessage);
        return;
      }
      this.zustand.logger.error("WorkerManager: unknown message", msg);
    } catch (e) {
      console.error("WorkerManager: onmessage JSON.parse error", e, event);
      return;
    }
  }

  setWorker(worker: FuncNodesWorker | undefined) {
    for (let w in this.workers) {
      if (w !== worker?.uuid) {
        this.workers[w].disconnect();
      }
    }
    if (worker !== undefined) {
      this.workers[worker.uuid] = worker;
      worker.reconnect();
    }
    if (worker?.uuid)
      window.localStorage.setItem("funcnodes__active_worker", worker?.uuid);
    if (this.zustand.worker !== undefined) {
      this.zustand.clear_all();
    }
    this.zustand.set_worker(worker);
    this.on_setWorker(worker);
  }

  async restart_worker(workerid: string) {
    this.ws?.send(JSON.stringify({ type: "restart_worker", workerid }));
  }

  private calculateReconnectTimeout(): number {
    // Increase timeout exponentially, capped at maxTimeout
    let timeout = Math.min(
      this.initialTimeout * Math.pow(2, this.reconnectAttempts),
      this.maxTimeout
    );
    return timeout;
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      let timeout = this.calculateReconnectTimeout();
      this.zustand.logger.info(`Attempting to reconnect in ${timeout} ms`);

      setTimeout(() => {
        if (this.ws) {
          if (this.ws.readyState === WebSocket.OPEN) {
            return;
          }
        }
        this.reconnectAttempts++;
        this.connect();
      }, timeout);
    } else {
      this.zustand.logger.warn(
        "Maximum reconnect attempts reached. Giving up."
      );
    }
  }

  onclose() {
    this.zustand.logger.warn("WorkerManager: onclose");
    this.reconnect(); // Attempt to reconnect
  }

  set_active(workerid: string) {
    if (!this.ws) return;
    this.ws.send(JSON.stringify({ type: "set_active", workerid }));
  }

  new_worker({
    name,
    reference,
    copyLib,
    copyNS,
    in_venv,
  }: {
    name?: string;
    reference?: string;
    copyLib?: boolean;
    copyNS?: boolean;
    in_venv?: boolean;
  }) {
    if (!name) name = undefined;
    if (!copyLib) copyLib = false;
    if (!copyNS) copyNS = false;
    if (!reference) {
      reference = undefined;
      copyLib = false;
      copyNS = false;
    }

    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: "new_worker",
          kwargs: {
            name,
            reference,
            copyLib,
            copyNS,
            in_venv,
          },
        })
      );
    }
  }

  remove() {
    /// closes all websockets permanently
    for (let w in this.workers) {
      this.workers[w].disconnect();
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = undefined;
    }

    if (this.ws) {
      this.ws.onclose = () => {
        // do nothing
      };
      this.ws.onerror = () => {
        // do nothing
      };
      this.ws.onmessage = () => {
        // do nothing
      };
      this.ws.onopen = () => {
        // do nothing
      };

      this.ws.close();
    }
  }
}
