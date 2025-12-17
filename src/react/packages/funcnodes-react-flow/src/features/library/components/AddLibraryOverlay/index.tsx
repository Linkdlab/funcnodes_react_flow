import * as React from "react";
import { useState } from "react";
import { useFuncNodesContext } from "@/providers";

import { CustomDialog } from "@/shared-components";
import {
  AvailableModule,
  ActiveModule,
  AddableModule,
  InstallableModule,
  GroupedAvailableModules,
} from "@/library/components";
import { useWorkerApi } from "@/workers";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const AddLibraryOverlay = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filter, setFilter] = useState(""); // State for the filter input
  const zustand: FuncNodesReactFlow = useFuncNodesContext();
  const [activeExtended, SetActiveExtended] = useState(true);
  const [availableExtended, SetAvailableExtended] = useState(true);
  const [installedExtended, SetInstalledExtended] = useState(true);

  const [availableModules, SetAvailableModules] =
    useState<GroupedAvailableModules>({
      installed: [],
      available: [],
      active: [],
    });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { lib: libAPI } = useWorkerApi();

  const update_modules = (open: boolean) => {
    if (!open) return;

    if (zustand.worker === undefined || !zustand.worker.is_open) {
      return;
    }

    libAPI
      ?.get_available_modules({
        on_load: (modules) => {
          SetAvailableModules(modules);
        },
      })
      .then((modules) => {
        SetAvailableModules(modules);
      });
  };

  if (!zustand.worker) {
    return <></>;
  }

  const add_new_lib_from_installed = React.useCallback(
    (module: AvailableModule, release: string) => {
      setIsDialogOpen(false);
      libAPI?.add_lib(module.name, release); // use name as module name
    },
    [libAPI]
  );

  const add_new_lib_from_installable = React.useCallback(
    (module: AvailableModule, release: string) => {
      setIsDialogOpen(false);
      libAPI?.add_lib(module.name, release); // use name as module name
    },
    [libAPI]
  );

  const remove_lib_from_active = React.useCallback(
    (module: AvailableModule) => {
      setIsDialogOpen(false);
      libAPI?.remove_lib(module.name);
    },
    [libAPI]
  );

  const update_lib = React.useCallback(
    (module: AvailableModule, release: string) => {
      setIsDialogOpen(false);
      libAPI?.add_lib(module.name, release);
    },
    [libAPI]
  );

  // Filter the modules based on the search term, ignoring case
  const filterModules = React.useCallback(
    (modules: AvailableModule[]) =>
      modules.filter(
        (module) =>
          module.name.toLowerCase().includes(filter.toLowerCase()) ||
          module.description.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter]
  );

  const availableModulesFiltered = filterModules(availableModules.available);
  const installedModulesFiltered = filterModules(availableModules.installed);
  const activeModulesFiltered = filterModules(availableModules.active);

  return (
    <CustomDialog
      title="Manage Library"
      trigger={children}
      description="Add or remove libraries to the current worker."
      onOpenChange={update_modules}
      open={isDialogOpen}
      setOpen={setIsDialogOpen}
    >
      <input
        className="filter-input styledinput"
        type="text"
        placeholder="Filter modules..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)} // Update filter state on input change
      />
      <div
        className="packagelist"
        style={{ maxHeight: "70%", overflow: "auto" }}
      >
        {installedModulesFiltered.length > 0 && (
          <h3
            onClick={() => {
              SetInstalledExtended(!installedExtended);
            }}
          >
            Installed
          </h3>
        )}
        {installedExtended &&
          installedModulesFiltered.map((item) => (
            <AddableModule
              key={item.name + item.source}
              availableModule={item}
              on_add={add_new_lib_from_installed}
            />
          ))}

        {availableModulesFiltered.length > 0 && (
          <h3
            onClick={() => {
              SetAvailableExtended(!availableExtended);
            }}
          >
            Available
          </h3>
        )}
        {availableExtended &&
          availableModulesFiltered.map((item) => (
            <InstallableModule
              key={item.name + item.source}
              availableModule={item}
              on_add={add_new_lib_from_installable}
            />
          ))}
        {activeModulesFiltered.length > 0 && (
          <h3
            onClick={() => {
              SetActiveExtended(!activeExtended);
            }}
          >
            Active
          </h3>
        )}
        {activeExtended &&
          activeModulesFiltered.map((item) => (
            <ActiveModule
              key={item.name + item.source}
              availableModule={item}
              on_remove={remove_lib_from_active}
              on_update={update_lib}
            />
          ))}
      </div>
    </CustomDialog>
  );
};
