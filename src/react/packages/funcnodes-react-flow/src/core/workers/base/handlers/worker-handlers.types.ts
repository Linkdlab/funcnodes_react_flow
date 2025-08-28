import { FuncNodesWorker } from "../funcnodes-worker";

/**
 * Defines the required context for handler classes, providing access
 * to the parent worker instance.
 */
export interface WorkerHandlerContext {
  worker: FuncNodesWorker;
}

/**
 * Abstract base class for handler classes.
 */
export abstract class AbstractWorkerHandler {
  protected context: WorkerHandlerContext;

  constructor(context: WorkerHandlerContext) {
    this.context = context;
  }

  abstract start(): void;
  abstract stop(): void;

  protected get communicationManager() {
    return this.context.worker.getCommunicationManager();
  }

  protected get eventManager() {
    return this.context.worker.getEventManager();
  }

  protected get hookManager() {
    return this.context.worker.getHookManager();
  }

  protected get nodeManager() {
    return this.context.worker.getNodeManager();
  }

  protected get syncManager() {
    return this.context.worker.getSyncManager();
  }

  protected get connectionHealthManager() {
    return this.context.worker.getConnectionHealthManager();
  }

  protected get edgeManager() {
    return this.context.worker.getEdgeManager();
  }

  protected get groupManager() {
    return this.context.worker.getGroupManager();
  }

  protected get libraryManager() {
    return this.context.worker.getLibraryManager();
  }
}
