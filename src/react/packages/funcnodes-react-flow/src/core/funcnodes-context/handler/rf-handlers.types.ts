import { FuncNodesReactFlow } from "../core";

/**
 * Defines the required context for handler classes, providing access
 * to the parent worker instance.
 */
export interface FuncNodesReactFlowHandlerContext {
  rf: FuncNodesReactFlow;
}

/**
 * Abstract base class for handler classes.
 */
export abstract class AbstractFuncNodesReactFlowHandleHandler {
  protected context: FuncNodesReactFlowHandlerContext;

  constructor(context: FuncNodesReactFlowHandlerContext) {
    this.context = context;
  }

  protected get nodespaceManager() {
    return this.context.rf.getNodespaceManager();
  }
  protected get libManager() {
    return this.context.rf.getLibManager();
  }
  protected get workerManager() {
    return this.context.rf.getWorkerManager();
  }
  protected get stateManager() {
    return this.context.rf.getStateManager();
  }
  protected get pluginManager() {
    return this.context.rf.getPluginManager();
  }
  protected get reactFlowManager() {
    return this.context.rf.getReactFlowManager();
  }
}
