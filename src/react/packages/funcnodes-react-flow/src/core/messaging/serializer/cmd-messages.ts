export type CmdMessage = {
  type: string;
  cmd: string;
  kwargs: any;
  as_bytes?: boolean;
  id?: string;
};
