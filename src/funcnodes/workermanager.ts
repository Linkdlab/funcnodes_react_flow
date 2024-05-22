import {
  FuncNodesReactFlowZustandInterface,
  ProgressStateMessage,
  WorkersState,
} from "../states/fnrfzst.t";
import FuncNodesWorker from "./funcnodesworker";
import WebSocketWorker from "./websocketworker";

class WorkerManager {
  private wsuri: string;
  private workers: any;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 999;
  private initialTimeout: number = 200; // Initial reconnect delay in ms
  private maxTimeout: number = 2000; // Maximum reconnect delay
  private zustand: FuncNodesReactFlowZustandInterface;
  private connectionTimeout?: NodeJS.Timeout;
  on_setWorker: (worker: FuncNodesWorker | undefined) => void;
  constructor(wsuri: string, zustand: FuncNodesReactFlowZustandInterface) {
    this.wsuri = wsuri;
    this.zustand = zustand;
    this.workers = {};
    this.on_setWorker = (worker: FuncNodesWorker | undefined) => {
      console.log("WorkerManager: on_setWorker", worker);
      this.zustand.worker = worker;
    };
    this.connect();
  }
  private connect(): void {
    this.zustand.set_progress({
      progress: 0,
      message: "connecting to worker manager",
      status: "info",
      blocking: true,
    });
    console.log("Connecting to websocket:", this.wsuri);
    this.ws = new WebSocket(this.wsuri);

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
      this.onmessage(event.data);
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
    console.log("WorkerManager: onopen");
    if (this.ws) {
      this.ws.send("worker_status");
    }

    // Get active worker from window storage
    const active_worker = window.localStorage.getItem(
      "funcnodes__active_worker",
    );
    if (active_worker) {
      this.set_active(active_worker);
    }
  }
  onmessage(event: string) {
    let msg = JSON.parse(event);
    if (msg.type === "worker_status") {
      console.debug("WorkerManager: worker_status", msg);
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
            }),
        );
      } else {
        console.error("WorkerManager: unknown worker type", msg);
      }

      //store active worker in window storage

      return;
    } else if (msg.type === "progress") {
      this.zustand.set_progress(msg as ProgressStateMessage);
      return;
    }
    console.error("WorkerManager: unknown message", msg);
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
    window.localStorage.setItem("funcnodes__active_worker", worker?.uuid || "");
    if (this.zustand.worker !== undefined) {
      this.zustand.clear_all();
    }
    this.zustand.worker = worker;
    this.on_setWorker(worker);
  }

  async restart_worker(workerid: string) {
    this.ws?.send(JSON.stringify({ type: "restart_worker", workerid }));
  }

  private calculateReconnectTimeout(): number {
    // Increase timeout exponentially, capped at maxTimeout
    let timeout = Math.min(
      this.initialTimeout * Math.pow(2, this.reconnectAttempts),
      this.maxTimeout,
    );
    return timeout;
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      let timeout = this.calculateReconnectTimeout();
      console.log(`Attempting to reconnect in ${timeout} ms`);

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
      console.warn("Maximum reconnect attempts reached. Giving up.");
    }
  }

  onclose() {
    console.log("WorkerManager: onclose");
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
  }: {
    name?: string;
    reference?: string;
    copyLib?: boolean;
    copyNS?: boolean;
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
          },
        }),
      );
    }
  }
}

export default WorkerManager;
