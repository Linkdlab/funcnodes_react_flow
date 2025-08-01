import {
  AbstractWorkerHandler,
  WorkerHandlerContext,
} from "./worker-handlers.types";
const PONG_DELAY = 2000; // 2 seconds

export class WorkerConnectionHealthManager extends AbstractWorkerHandler {
  private _responsive: boolean = false;
  private _last_pong: number = 0;
  private pingInterval: NodeJS.Timeout | undefined;
  private responsivenessCheckInterval: NodeJS.Timeout | undefined;

  constructor(context: WorkerHandlerContext) {
    super(context);
    this._last_pong = Date.now() - PONG_DELAY * 100;
  }

  public start(): void {
    this.stop(); // Ensure no existing intervals are running
    this.pingInterval = setInterval(() => {
      if (this.context.worker.is_open) {
        this.context.worker.send({ type: "ping" });
      }
    }, PONG_DELAY);

    this.responsivenessCheckInterval = setInterval(() => {
      this._responsive = Date.now() - this._last_pong <= PONG_DELAY * 3;
    }, PONG_DELAY * 2);
  }

  public stop(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.responsivenessCheckInterval)
      clearInterval(this.responsivenessCheckInterval);
  }

  public receivePong(): void {
    this._last_pong = Date.now();
    this._responsive = true;
  }

  public isResponsive(): boolean {
    return this._responsive;
  }
}
