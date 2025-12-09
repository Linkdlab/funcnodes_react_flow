import { GroupedAvailableModules } from "@/library/components";
import { AbstractWorkerHandler } from "./worker-handlers.types";
import { SchemaResponse } from "@/shared-components/jsonSchemaForm";

export interface WorkerLibraryManagerAPI {
  add_external_worker: (params: {
    module: string;
    cls_module: string;
    cls_name: string;
  }) => Promise<void>;
  add_lib: (lib: string, release: string) => Promise<void>;
  remove_lib: (lib: string) => Promise<void>;
  get_available_modules: () => Promise<GroupedAvailableModules>;
  remove_external_worker: (
    worker_id: string,
    class_id: string
  ) => Promise<void>;
  get_external_worker_config: (
    worker_id: string,
    class_id: string
  ) => Promise<SchemaResponse>;
}

export class WorkerLibraryManager
  extends AbstractWorkerHandler
  implements WorkerLibraryManagerAPI
{
  public start(): void {
    // no-op
  }

  public stop(): void {
    // no-op
  }
  async add_external_worker({
    module,
    cls_module,
    cls_name,
  }: {
    module: string;
    cls_module: string;
    cls_name: string;
  }) {
    return await this.communicationManager._send_cmd({
      cmd: "add_external_worker",
      kwargs: { module, cls_module, cls_name },
    });
  }

  async add_lib(lib: string, release: string) {
    const ans = await this.communicationManager._send_cmd({
      cmd: "add_package_dependency",
      kwargs: { name: lib, version: release },
      wait_for_response: false,
    });
    return ans;
  }

  async remove_lib(lib: string) {
    const ans = await this.communicationManager._send_cmd({
      cmd: "remove_package_dependency",
      kwargs: { name: lib },
      wait_for_response: false,
    });
    return ans;
  }

  async get_available_modules() {
    const res = await this.communicationManager._send_cmd({
      cmd: "get_available_modules",
      wait_for_response: true,
      unique: true,
    });
    return res as GroupedAvailableModules;
  }

  async remove_external_worker(worker_id: string, class_id: string) {
    const res = await this.communicationManager._send_cmd({
      cmd: "remove_external_worker",
      kwargs: { worker_id, class_id },
      wait_for_response: true,
    });
    return res;
  }

  async get_external_worker_config(
    worker_id: string,
    class_id: string
  ): Promise<SchemaResponse> {
    const res = await this.communicationManager._send_cmd({
      cmd: "get_external_worker_config",
      kwargs: { worker_id, class_id },
      wait_for_response: true,
    });
    return res as SchemaResponse;
  }
}
