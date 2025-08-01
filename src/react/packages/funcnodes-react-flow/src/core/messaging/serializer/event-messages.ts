export interface NodeSpaceEvent {
  type: "nsevent";
  event: string;
  data: { [key: string]: any | undefined };
}

export interface WorkerEvent {
  type: "workerevent";
  event: string;
  data: { [key: string]: any | undefined };
}
