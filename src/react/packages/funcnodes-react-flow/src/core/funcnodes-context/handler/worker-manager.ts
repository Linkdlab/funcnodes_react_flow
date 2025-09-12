import { UseBoundStore, StoreApi, create } from "zustand";
import {
  AbstractFuncNodesReactFlowHandleHandler,
  FuncNodesReactFlowHandlerContext,
} from "./rf-handlers.types";
import {
  WorkersState,
  FuncNodesWorkerState,
  FuncNodesWorker,
  WorkerManager,
} from "@/workers";
export interface WorkerManagerManagerAPI {
  set_worker: (worker: FuncNodesWorker | undefined) => void;
}

export class WorkerManagerHandler
  extends AbstractFuncNodesReactFlowHandleHandler
  implements WorkerManagerManagerAPI
{
  worker: FuncNodesWorker | undefined;
  workermanager: WorkerManager | undefined;
  workers: UseBoundStore<StoreApi<WorkersState>>;
  workerstate: UseBoundStore<StoreApi<FuncNodesWorkerState>>;
  _unsubscribeFromWorker: (() => void) | undefined;
  constructor(context: FuncNodesReactFlowHandlerContext) {
    super(context);
    context.rf.logger.debug("Initializing worker manager handler");
    this.workers = create<WorkersState>((_set, _get) => ({}));
    this.workerstate = create<FuncNodesWorkerState>((_set, _get) => ({
      is_open: false,
    }));
  }

  set_worker(worker: FuncNodesWorker | undefined) {
    if (worker === this.worker) {
      return;
    }

    if (this._unsubscribeFromWorker) {
      this._unsubscribeFromWorker();
      this._unsubscribeFromWorker = undefined;
    }

    // If new worker is provided
    if (worker) {
      this.context.rf.logger.debug("Setting worker in worker manager");
      this._unsubscribeFromWorker = worker.state.subscribe((newState) => {
        this.workerstate.setState(newState);
      });

      this.workerstate.setState(worker.state.getState());
    } else {
      this.context.rf.logger.debug("Removing worker in worker manager");
    }

    // Update the reference
    this.worker = worker;
    worker?.set_zustand(this.context.rf);
  }
}
