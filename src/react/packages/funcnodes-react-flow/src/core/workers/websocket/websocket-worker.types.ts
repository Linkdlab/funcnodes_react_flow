import type { WorkerProps } from "../base/worker.types";
export interface WebSocketWorkerProps extends WorkerProps {
  url: string;
}
