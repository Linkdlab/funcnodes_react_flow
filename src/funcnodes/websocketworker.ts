import FuncNodesWorker, { WorkerProps } from './funcnodesworker'

interface WebSocketWorkerProps extends WorkerProps {
  url: string
}
class WebSocketWorker extends FuncNodesWorker {
  private _url: string
  private _websocket: WebSocket | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 999
  private initialTimeout: number = 200 // Initial reconnect delay in ms
  private maxTimeout: number = 5000 // Maximum reconnect delay
  private _reconnect: boolean = true
  constructor(data: WebSocketWorkerProps) {
    super(data)
    this._url = data.url
    this.connect()
    if (this._zustand) this._zustand.auto_progress()
  }

  private connect(): void {
    console.log('Connecting to websocket')
    this.is_open = false
    this._websocket = new WebSocket(this._url)

    this._websocket.onopen = () => {
      this.onopen()
    }

    this._websocket.onclose = () => {
      this.onclose()
    }

    this._websocket.onerror = () => {
      this.on_ws_error()
    }

    this._websocket.onmessage = (event) => {
      this.onmessage(event.data)
    }
  }

  private calculateReconnectTimeout(): number {
    // Increase timeout exponentially, capped at maxTimeout
    let timeout = Math.min(
      this.initialTimeout * Math.pow(2, this.reconnectAttempts),
      this.maxTimeout
    )
    return timeout
  }
  private auto_reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      let timeout = this.calculateReconnectTimeout()
      console.log(`Attempting to reconnect in ${timeout} ms`)

      setTimeout(() => {
        if (this._websocket) {
          if (this._websocket.readyState === WebSocket.OPEN) {
            return
          }
        }
        this.reconnectAttempts++
        this.connect()
      }, timeout)
    } else {
      console.warn('Maximum reconnect attempts reached. Giving up.')
    }
  }

  async onmessage(data: string) {
    await this.recieve(JSON.parse(data))
  }

  onopen() {
    console.log('Websocket opened')
    this.is_open = true
    if (this._zustand) this._zustand.auto_progress()
    this.reconnectAttempts = 0
    this.fullsync()
  }
  onclose() {
    console.log('Websocket closed', this)
    super.onclose()
    if (this._reconnect) {
      console.log('Websocket closed,reconnecting')
      this.auto_reconnect() // Attempt to reconnect
    }
  }

  on_ws_error() {
    console.warn('Websocket error')
    if (this._websocket) {
      this._websocket.close() // Ensure the connection is closed before attempting to reconnect
    } else {
      this.auto_reconnect()
    }
  }

  async send(data: any) {
    if (!this._websocket || this._websocket.readyState !== WebSocket.OPEN) {
      throw new Error('Websocket not connected')
    }

    this._websocket.send(JSON.stringify(data))
  }

  async stop() {
    await super.stop()
    this._reconnect = false
    // this.close();
  }
  close() {
    if (this._websocket) this._websocket.close()
  }
  disconnect() {
    super.disconnect()
    this._reconnect = false
    this.close()
  }

  async reconnect() {
    await super.reconnect()
    this._reconnect = true
    if (this._websocket) {
      console.log('Reconnecting', this._websocket.readyState)
      if (
        this._websocket.readyState === WebSocket.OPEN ||
        this._websocket.readyState === WebSocket.CONNECTING
      ) {
        if (this._websocket.readyState === WebSocket.CONNECTING) {
          //await to ensure the websocket is connected, with a timeout of 2 seconds
          await new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
              reject('Timeout')
            }, 2000)
            this._websocket?.addEventListener('open', () => {
              clearTimeout(timeout)
              resolve(null)
            })
          })
        }
        if (this._websocket.readyState === WebSocket.OPEN) {
          this.fullsync()
          return
        }
      }
    }
    this.connect()
  }
}

export default WebSocketWorker
