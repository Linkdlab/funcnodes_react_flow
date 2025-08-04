import { FuncNodesWorker, useWorkerApi } from "@/workers";
import { IOStore } from "../interfaces/io";

export const io_try_get_full_value = (
  iostore: IOStore,
  worker?: FuncNodesWorker
) => {
  const io = iostore.io_state.getState();
  if (!worker) {
    const { node } = useWorkerApi();
    node?.get_io_full_value({ nid: io.node, ioid: io.id });
  } else {
    worker.api.node.get_io_full_value({ nid: io.node, ioid: io.id });
  }
};

export const io_set_hidden = (
  iostore: IOStore,
  v: boolean,
  worker?: FuncNodesWorker
) => {
  const io = iostore.io_state.getState();
  if (!worker) {
    const { node } = useWorkerApi();
    node?.update_io_options({
      nid: io.node,
      ioid: io.id,
      options: { hidden: v },
    });
  } else {
    worker.api.node.update_io_options({
      nid: io.node,
      ioid: io.id,
      options: { hidden: v },
    });
  }
};
