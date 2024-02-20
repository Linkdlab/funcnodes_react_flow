import FuncNodesWorker from "./funcnodesworker";
import { FuncNodesReactFlowZustandInterface } from "../state";
class WebSocketWorker extends FuncNodesWorker {
  private _url: string;
  private _websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 999;
  private initialTimeout: number = 1000; // Initial reconnect delay in ms
  private maxTimeout: number = 30000; // Maximum reconnect delay
  constructor(url: string, zustand: FuncNodesReactFlowZustandInterface) {
    super(zustand);
    this._url = url;
    this.connect();
  }

  private connect(): void {
    console.log("Connecting to websocket");
    this._websocket = new WebSocket(this._url);

    this._websocket.onopen = () => {
      this.onopen();
    };

    this._websocket.onclose = () => {
      this.onclose();
    };

    this._websocket.onerror = () => {
      this.on_ws_error();
    };

    this._websocket.onmessage = (event) => {
      this.onmessage(event.data);
    };
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
      console.log(`Attempting to reconnect in ${timeout} ms`);

      setTimeout(() => {
        if (this._websocket) {
          if (this._websocket.readyState === WebSocket.OPEN) {
            return;
          }
        }
        this.reconnectAttempts++;
        this.connect();
      }, timeout);
    } else {
      console.log("Maximum reconnect attempts reached. Giving up.");
    }
  }

  async onmessage(data: any) {
    await this.recieve(JSON.parse(data));
  }

  onopen() {
    console.log("Websocket opened");
    this.reconnectAttempts = 0;
    this.fullsync();
  }

  onclose() {
    console.log("Websocket closed,reconnecting");
    this.reconnect(); // Attempt to reconnect
  }

  on_ws_error() {
    console.log("Websocket error");
    if (this._websocket) {
      this._websocket.close(); // Ensure the connection is closed before attempting to reconnect
    } else {
      this.reconnect();
    }
  }

  async send(data: any) {
    console.log("Sending data", data);
    if (!this._websocket) {
      throw new Error("Websocket not connected");
    }
    this._websocket.send(JSON.stringify(data));
  }

  close() {
    if (this._websocket) this._websocket.close();
  }
}

export default WebSocketWorker;
