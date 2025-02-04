import axios from "axios";
import { LargeMessageHint } from "../states/fnrfzst.t";
import FuncNodesWorker, { WorkerProps } from "./funcnodesworker";

interface WebSocketWorkerProps extends WorkerProps {
  url: string;
}
class WebSocketWorker extends FuncNodesWorker {
  private _url: string;
  private _websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 999;
  private initialTimeout: number = 200; // Initial reconnect delay in ms
  private maxTimeout: number = 5000; // Maximum reconnect delay
  private _reconnect: boolean = true;
  constructor(data: WebSocketWorkerProps) {
    super(data);
    this._url = data.url;
    this.connect();
    if (this._zustand) this._zustand.auto_progress();
  }

  private connect(): void {
    this._zustand?.logger.info("Connecting to websocket");
    this.is_open = false;
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
  private auto_reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      let timeout = this.calculateReconnectTimeout();
      this._zustand?.logger.info(`Attempting to reconnect in ${timeout} ms`);

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
      this._zustand?.logger.warn(
        "Maximum reconnect attempts reached. Giving up."
      );
    }
  }

  async onmessage(data: string) {
    const json = JSON.parse(data);

    this._zustand?.logger.debug(
      `Recieved data of length: ${data.length} and data"`,
      json
    );

    await this.recieve(json);
  }

  get http_protocol(): string {
    return this.secure_url ? "https" : "http";
  }
  get secure_url(): boolean {
    return this._url.startsWith("wss");
  }
  get url_wo_protocol(): string {
    return this._url.substring(this.secure_url ? 6 : 5);
  }
  get http_url(): string {
    var url = this.http_protocol + "://" + this.url_wo_protocol;
    // add / to url if it does not end with /
    if (url[url.length - 1] !== "/") {
      url += "/";
    }
    return url;
  }

  async upload_file({
    files,
    onProgressCallback,
    root,
  }: {
    files: File[] | FileList;
    onProgressCallback?: (loaded: number, total?: number) => void;
    root?: string;
  }): Promise<string[]> {
    const url = `${this.http_url}upload/`;
    const formdata = new FormData();
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    for (const file of fileArray) {
      const subtarget = file.webkitRelativePath || file.name;
      const target = root ? `${root}/${subtarget}` : subtarget;
      formdata.append("file", file, target);
    }

    try {
      const response = await axios.post(url, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgressCallback) {
            onProgressCallback(progressEvent.loaded, progressEvent.total);
          }
        },
      });

      // Assuming the server response contains a JSON object with the filename
      return response.data.file;
    } catch (error) {
      throw new Error("Failed to upload file");
    }
  }

  async handle_large_message_hint({ msg_id }: LargeMessageHint) {
    // make url from websocket url

    //add /msg_id to url to get the large message (url might end with /)
    const url = this.http_url + "message/" + msg_id;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const json = await resp.json();
    this.recieve(json);
  }

  onopen() {
    this._zustand?.logger.info("Websocket opened");
    this.is_open = true;
    if (this._zustand) this._zustand.auto_progress();
    this.reconnectAttempts = 0;
    this.stepwise_fullsync();
  }
  onclose() {
    this._zustand?.logger.info("Websocket closed");
    super.onclose();
    if (this._reconnect) {
      this._zustand?.logger.info("Websocket closed,reconnecting");
      this.auto_reconnect(); // Attempt to reconnect
    }
  }

  on_ws_error() {
    this._zustand?.logger.warn("Websocket error");
    if (this._websocket) {
      this._websocket.close(); // Ensure the connection is closed before attempting to reconnect
    } else {
      this.auto_reconnect();
    }
  }

  async send_large_message(jsondata: string) {
    const url = `${this.http_url}message/`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsondata,
    });
  }

  async send(data: any) {
    if (!this._websocket || this._websocket.readyState !== WebSocket.OPEN) {
      this._zustand?.logger.warn("Websocket not connected");
      return;
    }

    const jsonstring = JSON.stringify(data);
    const datasize = new Blob([jsonstring]).size;
    if (datasize > 1000000) {
      // 1MB
      this._zustand?.logger.info("Data too large, sending via http");
      return await this.send_large_message(jsonstring);
    }

    this._zustand?.logger.debug("Sending data", data);
    this._websocket.send(jsonstring);
  }

  async stop() {
    await super.stop();
    this._reconnect = false;
    // this.close();
  }
  close() {
    if (this._websocket) this._websocket.close();
  }
  disconnect() {
    super.disconnect();
    this._reconnect = false;
    this.close();
  }

  async reconnect() {
    await super.reconnect();
    this._reconnect = true;
    if (this._websocket) {
      this._zustand?.logger.info("Reconnecting");
      if (
        this._websocket.readyState === WebSocket.OPEN ||
        this._websocket.readyState === WebSocket.CONNECTING
      ) {
        if (this._websocket.readyState === WebSocket.CONNECTING) {
          //await to ensure the websocket is connected, with a timeout of 2 seconds
          await new Promise((resolve, reject) => {
            if (this._websocket === null) return;
            let timeout = setTimeout(() => {
              reject("Timeout@reconnect");
            }, 2000);
            this._websocket.addEventListener(
              "open",
              () => {
                clearTimeout(timeout);
                resolve(null);
              },
              { once: true }
            );
            if (this._websocket.readyState === WebSocket.OPEN) {
              clearTimeout(timeout);
              resolve(null);
            }
          });
        }
        if (this._websocket.readyState === WebSocket.OPEN) {
          this.stepwise_fullsync();
          return;
        }
      }
    }
    this.connect();
  }
}

export default WebSocketWorker;
