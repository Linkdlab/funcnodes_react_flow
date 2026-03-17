import type { WorkerProps } from "@/workers";
export interface WebSocketWorkerProps extends WorkerProps {
  url: string;
}
