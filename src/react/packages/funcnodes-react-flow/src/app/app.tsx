import * as React from "react";
import { remoteUrlToBase64 } from "@/data-helpers";
import { LimitedDeepPartial, object_factory_maker } from "@/object-helpers";
import { Toasts, ErrorDiv } from "@/shared-components";
import { ConsoleLogger, Logger } from "@/logging";
import { FuncNodesWorker, WebSocketWorker, WorkerManager } from "@/workers";
import { FuncnodesReactFlowProps } from "./app.types";
import { AVAILABLE_COLOR_THEMES, DEFAULT_FN_PROPS } from "./app-properties";
import { InnerFuncnodesReactFlow } from "./workspace";
import { v4 as uuidv4 } from "uuid";
import { FuncNodesReactFlow } from "@/funcnodes-context";
import { ThemeProvider } from "./providers";

declare global {
  interface Window {
    fnrf_zst?: {
      [key: string]: FuncNodesReactFlow | undefined;
    };
  }
}

export const DEFAULT_FN_PROPS_FACTORY: (
  obj?: LimitedDeepPartial<FuncnodesReactFlowProps>
) => FuncnodesReactFlowProps = object_factory_maker(
  DEFAULT_FN_PROPS,
  (obj: FuncnodesReactFlowProps) => {
    obj.id = uuidv4();
    return obj;
  }
);

const guard_check_props = (props: FuncnodesReactFlowProps) => {
  if (!props.useWorkerManager && props.worker === undefined) {
    throw new Error(
      "If you don't use a worker manager, you must provide a default worker."
    );
  }

  if (props.useWorkerManager && props.workermanager_url === undefined) {
    throw new Error(
      "Error: If you use a worker manager, you must provide a worker managerurl."
    );
  }
};

const FUNCNODESREACTFLOW_MAPPER: {
  [key: string]: FuncNodesReactFlow | undefined;
} = {};

if (window.fnrf_zst === undefined) {
  window.fnrf_zst = FUNCNODESREACTFLOW_MAPPER;
}

export const FuncNodes = (
  props: LimitedDeepPartial<FuncnodesReactFlowProps>
) => {
  const [fullProps, setFullProps] = React.useState<
    FuncnodesReactFlowProps | undefined
  >(undefined);

  const [fnrfzst, setFnrfZst] = React.useState<FuncNodesReactFlow | undefined>(
    undefined
  );

  const [readyCallbackFired, setReadyCallbackFired] = React.useState(false);

  // Effect 1: Initialize FullProps from partial props
  React.useEffect(() => {
    const fullprops = DEFAULT_FN_PROPS_FACTORY(props);

    // Initialize logger with default logger if not provided
    fullprops.logger =
      (fullprops.logger as Logger | undefined) ||
      new ConsoleLogger("FuncNodes", fullprops.debug ? "debug" : "info");

    fullprops.logger.debug("Initializing FuncNodes with props:", fullprops);
    setFullProps(fullprops);
    setReadyCallbackFired(false); // Reset ready callback flag when props change
  }, [props]);

  // Effect 2: Initialize or get Zustand store
  React.useEffect(() => {
    if (!fullProps) return;

    fullProps.logger?.debug("Initializing/Getting Zustand store");

    // Initialize or get existing zustand store
    const existing = FUNCNODESREACTFLOW_MAPPER[fullProps.id];
    if (existing === undefined) {
      const newStore = new FuncNodesReactFlow(fullProps);
      FUNCNODESREACTFLOW_MAPPER[fullProps.id] = newStore;
      setFnrfZst(newStore);
    } else {
      setFnrfZst(existing);
      existing.options.debug = fullProps.debug;
    }
  }, [fullProps?.id, fullProps?.debug]);

  // Effect 3: Manage Worker lifecycle
  React.useEffect(() => {
    if (!fullProps || !fnrfzst) return;
    // Skip if: a) a worker manager is used or b) no worker URL or worker is provided
    if (
      fullProps.useWorkerManager || // a) a worker manager is used
      (!fullProps.worker_url && !fullProps.worker) // b) no worker URL and no worker is provided
    )
      return;

    fullProps.logger?.debug("Worker effect running");

    // Check if we need to create a worker
    if (!fullProps.worker && fullProps.worker_url) {
      fullProps.logger?.debug("Creating WebSocket worker");

      const worker = new WebSocketWorker({
        url: fullProps.worker_url,
        uuid: fullProps.id,
        on_sync_complete: fullProps.on_sync_complete,
      });

      worker.set_zustand(fnrfzst);

      // Update fullProps with the new worker
      setFullProps((prev) =>
        prev ? { ...prev, worker, useWorkerManager: false } : prev
      );

      // Cleanup: disconnect worker
      return () => {
        fullProps.logger?.debug("Disconnecting worker");
        worker.disconnect();
        setFullProps((prev) => (prev ? { ...prev, worker: undefined } : prev));
      };
    } else {
      // Worker already exists, just ensure zustand is set
      fullProps.worker?.set_zustand(fnrfzst);
      return; // Explicit return for consistency
    }
  }, [
    fullProps?.worker_url,
    fullProps?.id,
    fullProps?.useWorkerManager,
    fnrfzst,
    fullProps?.on_sync_complete,
  ]);

  // Effect 4: Handle fnw_url loading
  React.useEffect(() => {
    if (!fullProps?.fnw_url || !fullProps.worker) return;

    fullProps.logger?.debug("Loading fnw_url data");

    let cancelled = false;
    const syncManager = fullProps.worker.getSyncManager();
    let afterNextSyncCallback:
      | ((worker: FuncNodesWorker) => Promise<void>)
      | undefined;

    const loadFnwData = async () => {
      try {
        const fnw_data = await remoteUrlToBase64(fullProps.fnw_url!);
        if (cancelled) return;
        afterNextSyncCallback = async (worker: FuncNodesWorker) => {
          if (cancelled) return;
          await worker.update_from_export(fnw_data);
        };
        syncManager.add_after_next_sync(afterNextSyncCallback);
      } catch (error) {
        if (error instanceof Error) {
          fullProps.logger?.error("Failed to load fnw_url:", error);
        } else {
          fullProps.logger?.error(
            "Failed to load fnw_url:",
            new Error(String(error))
          );
        }
      }
    };

    loadFnwData();

    return () => {
      cancelled = true;
      if (afterNextSyncCallback) {
        syncManager.remove_after_next_sync(afterNextSyncCallback);
      }
    };
  }, [fullProps?.fnw_url, fullProps?.worker]);

  // Effect 5: Manage Worker Manager lifecycle
  React.useEffect(() => {
    if (!fullProps || !fnrfzst || !fullProps.useWorkerManager) return;

    if (!fullProps.workermanager_url) {
      throw new Error(
        "Error: If you use a worker manager, you must provide a worker manager url."
      );
    }

    fnrfzst.logger.info("Worker manager effect running");

    // Check if we need to initialize or update the worker manager
    const needsInit = !fnrfzst.workermanager;
    const needsUpdate =
      fnrfzst.workermanager &&
      fnrfzst.workermanager.wsuri !== fullProps.workermanager_url;

    if (needsInit || needsUpdate) {
      // Remove old manager if it exists
      if (fnrfzst.workermanager) {
        fnrfzst.logger.info("Removing existing worker manager");
        fnrfzst.workermanager.remove();
        fnrfzst.workermanager = undefined;
      }

      // Create new manager
      fnrfzst.logger.info("Creating new worker manager");
      const workermanager = new WorkerManager(
        fullProps.workermanager_url,
        fnrfzst
      );
      fnrfzst.workermanager = workermanager;

      // set zustand
      setFullProps((prev) => (prev ? { ...prev, workermanager } : prev));

      // Cleanup only removes if this exact instance matches
      return () => {
        fnrfzst.logger.info("Worker manager cleanup running");
        if (fnrfzst.workermanager === workermanager) {
          fnrfzst.logger.info("Removing worker manager instance");
          workermanager.remove();
          fnrfzst.workermanager = undefined;
        } else {
          fnrfzst.logger.info(
            "Worker manager instance mismatch, skipping cleanup"
          );
        }
      };
    } else {
      fnrfzst.logger.info(
        "Worker manager already initialized with correct URL"
      );
      return; // Explicit return for consistency
    }
  }, [
    fullProps?.useWorkerManager,
    fullProps?.workermanager_url,
    fullProps?.id,
    fnrfzst,
  ]);

  // Effect 6: Fire on_ready callback when everything is ready
  React.useEffect(() => {
    if (!fullProps || !fnrfzst || readyCallbackFired) return;

    const shouldFireCallback = fullProps.useWorkerManager
      ? fnrfzst.workermanager !== undefined
      : fullProps.worker !== undefined;

    if (
      shouldFireCallback &&
      fullProps.on_ready &&
      typeof fullProps.on_ready === "function"
    ) {
      fullProps.logger?.debug("Firing on_ready callback");
      fullProps.on_ready({ fnrf_zst: fnrfzst });
      setReadyCallbackFired(true);
    }
  }, [
    fullProps,
    fnrfzst,
    readyCallbackFired,
    fullProps?.useWorkerManager,
    fnrfzst?.workermanager,
    fullProps?.worker,
  ]);

  // Render logic
  if (fullProps === undefined || fnrfzst === undefined) {
    return <div>Loading...</div>;
  }

  // Guard check props
  try {
    guard_check_props(fullProps);
  } catch (error) {
    return <ErrorDiv error={error as Error} />;
  }

  return (
    <div className="FuncnodesApp">
      <ThemeProvider available_themes={AVAILABLE_COLOR_THEMES}>
        <Toasts duration={5000}>
          <InnerFuncnodesReactFlow
            fnrf_zst={fnrfzst}
            header={fullProps.header}
            library={fullProps.library}
            flow={fullProps.flow}
          />
        </Toasts>
      </ThemeProvider>
    </div>
  );
};
