export interface WorkerRepresentation {
  uuid: string;
  host: string;
  port: number;
  ssl: boolean;
  active: boolean;
  open: boolean;
  name: string | null;
  type?: string;
  autostart?: boolean;
  data_path?: string | null;
  env_path?: string | null;
  pid?: number | null;
  update_on_startup?: Record<string, boolean>;
}

export interface WorkersState {
  [key: string]: WorkerRepresentation | undefined;
}
