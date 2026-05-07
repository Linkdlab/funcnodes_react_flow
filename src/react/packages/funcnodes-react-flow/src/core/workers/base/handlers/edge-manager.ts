import { AbstractWorkerHandler } from "./worker-handlers.types";

export interface WorkerEdgeManagerAPI {
  add_edge: (params: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
    replace?: boolean;
  }) => any;
  remove_edge: (params: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
  }) => any;
}

export class WorkerEdgeManager
  extends AbstractWorkerHandler
  implements WorkerEdgeManagerAPI
{
  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }

  /**
   * Connect two node IOs in the currently edited nodespace.
   */
  add_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
    replace = false,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
    replace?: boolean;
  }) {
    return this.communicationManager._send_cmd({
      cmd: "connect_at_path",
      kwargs: {
        path: this.activeNodeSpacePath,
        src_nid,
        src_ioid,
        trg_nid,
        trg_ioid,
        replace,
      },
    });
  }

  /**
   * Disconnect two node IOs in the currently edited nodespace.
   */
  remove_edge({
    src_nid,
    src_ioid,
    trg_nid,
    trg_ioid,
  }: {
    src_nid: string;
    src_ioid: string;
    trg_nid: string;
    trg_ioid: string;
  }) {
    return this.communicationManager._send_cmd({
      cmd: "disconnect_at_path",
      kwargs: {
        path: this.activeNodeSpacePath,
        src_nid,
        src_ioid,
        trg_nid,
        trg_ioid,
      },
    });
  }
}
