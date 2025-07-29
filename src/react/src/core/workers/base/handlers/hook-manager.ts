import { WorkerHookProperties } from "../worker.types";
import { AbstractWorkerHandler } from "./worker-handlers.types";

export interface WorkerHookManagerAPI {
  add_hook: (
    hook: string,
    callback: (p: WorkerHookProperties) => Promise<void>
  ) => () => void;
  call_hooks: (hook: string, data?: any) => Promise<void>;
}
export class WorkerHookManager
  extends AbstractWorkerHandler
  implements WorkerHookManagerAPI
{
  _hooks: Map<string, ((p: WorkerHookProperties) => Promise<void>)[]> =
    new Map();
  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }
  add_hook(
    hook: string,
    callback: (p: WorkerHookProperties) => Promise<void>
  ): () => void {
    const hooks = this._hooks.get(hook) || [];
    hooks.push(callback);
    this._hooks.set(hook, hooks);

    const remover = () => {
      const hooks = this._hooks.get(hook) || [];
      const idx = hooks.indexOf(callback);
      if (idx >= 0) {
        hooks.splice(idx, 1);
      }
    };
    return remover;
  }

  async call_hooks(hook: string, data?: any) {
    const promises = [];
    for (const h of this._hooks.get(hook) || []) {
      const p = h({ worker: this.context.worker, data: data });
      // check if the hook is async
      if (p instanceof Promise) {
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }
}
