export interface WorkerRepresentation {
  uuid: string;
  host: string;
  port: number;
  ssl: boolean;
  active: boolean;
  open: boolean;
  name: string | null;
}

export interface WorkersState {
  [key: string]: WorkerRepresentation | undefined;
}
