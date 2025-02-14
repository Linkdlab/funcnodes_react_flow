import React, { useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./lib.scss";

import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";
import { MouseEvent } from "react";
import { FuncNodesContext } from "./funcnodesreactflow";

import CustomDialog from "./dialog";
import {
  ExternalWorkerClassDep,
  ExternalWorkerDependencies,
  ExternalWorkerInstance,
  LibNode,
  Shelf,
} from "../states/lib.t";
import { CloseIcon, ExpandLessIcon, SearchIcon } from "./assets/mui";

const LibraryNode = ({ item }: { item: LibNode }) => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const add_to_flow = () => {
    zustand.worker?.add_node(item.node_id);
  };

  const nodeclick = (event: MouseEvent<HTMLDivElement>) => {
    // if double click, add node to graph
    if (event.detail === 2) {
      add_to_flow();
    }
  };
  return (
    <div className="libnodeentry" onClick={nodeclick} title={item.description}>
      {item.node_name || item.node_id}
    </div>
  );
};

const filterShelf = (shelf: Shelf, filter: string): boolean => {
  const hasFilteredNodes =
    shelf.nodes?.some((node) =>
      node.node_id.toLowerCase().includes(filter.toLowerCase())
    ) ?? false;

  const hasFilteredSubShelves =
    shelf.subshelves?.some((subShelf) => filterShelf(subShelf, filter)) ??
    false;

  return hasFilteredNodes || hasFilteredSubShelves;
};

const LibraryShelf = ({ item, filter }: { item: Shelf; filter: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const filterednodes = item.nodes?.filter((node) =>
    node.node_id.toLowerCase().includes(filter.toLowerCase())
  );

  const _isopen = isOpen || filter.length > 0;
  if (!filterShelf(item, filter)) {
    return <></>;
  }

  return (
    <div className="shelfcontainer">
      <div
        className="shelftitle"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
        title={item.description}
      >
        <div className="shelftitle_text">{item.name}</div>
        <div className={"expandicon " + (_isopen ? "open" : "close")}>
          <ExpandLessIcon />
        </div>
      </div>
      <div className={"libnodecontainer " + (_isopen ? "open" : "close")}>
        <div className="libnodecontainer_inner">
          {filterednodes && (
            <>
              {filterednodes.map((subItem, idx) => (
                <LibraryNode key={idx} item={subItem} />
              ))}
            </>
          )}
          {item.subshelves && (
            <>
              {item.subshelves.map((subItem, idx) => (
                <LibraryShelf key={idx} item={subItem} filter={filter} />
              ))}
            </>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
};

const LibFilter = ({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (filter: string) => void;
}) => {
  // input with left icon

  return (
    <div className="libfilter">
      <SearchIcon fontSize="inherit" />
      <input
        type="text"
        placeholder="Filter"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
        }}
      />
      {filter && (
        <CloseIcon
          fontSize="inherit"
          onClick={() => {
            setFilter("");
          }}
        />
      )}
    </div>
  );
};

interface availableModule {
  name: string;
  description: string;
  homepage: string;
  source: string;
  version: string;
  releases: string[];
}

const _ModuleLinks = ({
  availableModule,
}: {
  availableModule: availableModule;
}) => {
  return (
    <div className="module-links">
      {availableModule.homepage && (
        <>
          <a
            href={availableModule["homepage"]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Homepage
          </a>
        </>
      )}
      {availableModule.source && availableModule.homepage && " | "}
      {availableModule.source && (
        <>
          <a
            href={availableModule["source"]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>
        </>
      )}
    </div>
  );
};

const _ModuleDescription = ({
  availableModule,
}: {
  availableModule: availableModule;
}) => {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const toggleDescription = () => setExpandedDescription(!expandedDescription);
  const maxDescriptionLength = 150; // Max character length before truncating the description.

  const truncatedDescription =
    availableModule["description"].length > maxDescriptionLength
      ? availableModule["description"].substring(0, maxDescriptionLength) +
        "..."
      : availableModule["description"];

  return (
    <div className="module-description">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {expandedDescription
          ? availableModule["description"].replace(/\\n/g, "  \n")
          : truncatedDescription.replace(/\\n/g, "  \n")}
      </ReactMarkdown>
      {availableModule["description"].length > maxDescriptionLength && (
        <button onClick={toggleDescription} className="toggle-description">
          {expandedDescription ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

const _VersionSelector = ({
  availableModule,
  on_change,
}: {
  availableModule: availableModule;
  on_change: (release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    availableModule.version || "latest"
  );

  const [selectedRestriction, setSelectedRestriction] = useState(">=");

  const updateSelectedRelease = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const version = e.target.value;
    setSelectedRelease(version);
    if (version !== "latest") on_change(selectedRestriction + version);
    else on_change(version);
  };

  const updateSelectedRestriction = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedRestriction(e.target.value);
    if (selectedRelease !== "latest")
      on_change(e.target.value + selectedRelease);
  };

  // if availableModule.version is set and not in availableModule.releases, add it to the beginning of the list
  if (
    availableModule.releases &&
    !availableModule.releases.includes(selectedRelease)
  ) {
    availableModule.releases.unshift(selectedRelease);
  }
  return (
    <>
      <select value={selectedRestriction} onChange={updateSelectedRestriction}>
        <option value=">=">&gt;=</option>
        <option value="==">==</option>
        <option value="<=">&lt;=</option>
      </select>
      <select onChange={updateSelectedRelease} value={selectedRelease}>
        {availableModule["releases"] &&
          availableModule["releases"].map((release: string) => (
            <option key={release} value={release}>
              {release}
            </option>
          ))}
      </select>
    </>
  );
};

const ActiveModule = ({
  availableModule,
  on_remove,
  on_update,
}: {
  availableModule: availableModule;
  on_remove: (module: availableModule) => void;
  on_update: (module: availableModule, release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    availableModule.version || "latest"
  );

  return (
    <div className="addable-module">
      <div className="module-name">
        {availableModule["name"] +
          (availableModule.version ? ` (${availableModule.version})` : "")}
      </div>
      <_ModuleLinks availableModule={availableModule} />
      <_ModuleDescription availableModule={availableModule} />
      <div>
        <_VersionSelector
          availableModule={availableModule}
          on_change={setSelectedRelease}
        />
        <button
          className="update-button"
          disabled={selectedRelease === availableModule.version}
          onClick={() => {
            on_update(availableModule, selectedRelease);
          }}
        >
          Update
        </button>
        <button
          className="remove-button"
          onClick={() => {
            on_remove(availableModule);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const AddableModule = ({
  availableModule,
  on_add,
}: {
  availableModule: availableModule;
  on_add: (module: availableModule, release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    availableModule.version || "latest"
  );
  return (
    <div className="addable-module">
      <div className="module-name">
        {availableModule["name"] +
          (availableModule.version ? ` (${availableModule.version})` : "")}
      </div>
      <_ModuleLinks availableModule={availableModule} />
      <_ModuleDescription availableModule={availableModule} />
      <div>
        <_VersionSelector
          availableModule={availableModule}
          on_change={setSelectedRelease}
        />
        <button
          className="add-button"
          onClick={() => {
            on_add(availableModule, selectedRelease);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

const InstallableModule = ({
  availableModule,
  on_add,
}: {
  availableModule: availableModule;
  on_add: (module: availableModule, release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    availableModule.version || "latest"
  );

  return (
    <div className="addable-module">
      <div className="module-name">{availableModule["name"]}</div>
      <_ModuleLinks availableModule={availableModule} />
      <_ModuleDescription availableModule={availableModule} />
      <div>
        <_VersionSelector
          availableModule={availableModule}
          on_change={setSelectedRelease}
        />
        <button
          className="add-button"
          onClick={() => {
            on_add(availableModule, selectedRelease);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

const AddLibraryOverLay = ({ children }: { children: React.ReactNode }) => {
  const [filter, setFilter] = useState(""); // State for the filter input
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const [activeExtended, SetActiveExtended] = useState(true);
  const [availableExtended, SetAvailableExtended] = useState(true);
  const [installedExtended, SetInstalledExtended] = useState(true);

  const [availableModules, SetAvailableModules] = useState<{
    installed: availableModule[];
    available: availableModule[];
    active: availableModule[];
  }>({
    installed: [],
    available: [],
    active: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const update_modules = (open: boolean) => {
    if (!open) return;

    if (zustand.worker === undefined || !zustand.worker.is_open) {
      return;
    }

    zustand.worker.get_available_modules().then((modules) => {
      console.log(modules);
      SetAvailableModules(modules);
    });
  };

  if (!zustand.worker) {
    return <></>;
  }

  const add_new_lib_from_installed = (
    module: availableModule,
    release: string
  ) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib(module.name, release); // use name as module name
  };

  const add_new_lib_from_installable = (
    module: availableModule,
    release: string
  ) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib(module.name, release); // use name as module name
  };

  const remove_lib_from_active = (module: availableModule) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.remove_lib(module.name);
  };

  const update_lib = (module: availableModule, release: string) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib(module.name, release);
  };

  // Filter the modules based on the search term, ignoring case
  const filterModules = (modules: availableModule[]) =>
    modules.filter(
      (module) =>
        module.name.toLowerCase().includes(filter.toLowerCase()) ||
        module.description.toLowerCase().includes(filter.toLowerCase())
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
          installedModulesFiltered.map((item, idx) => (
            <AddableModule
              key={idx}
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
          availableModulesFiltered.map((item, idx) => (
            <InstallableModule
              key={idx}
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
          activeModulesFiltered.map((item, idx) => (
            <ActiveModule
              key={idx}
              availableModule={item}
              on_remove={remove_lib_from_active}
              on_update={update_lib}
            />
          ))}
      </div>
    </CustomDialog>
  );
};

const ExternalWorkerInstanceSettings = ({
  ins,
}: {
  ins: ExternalWorkerInstance;
}) => {
  const [tempName, setTempName] = useState(ins.name);
  const fnrz = useContext(FuncNodesContext);

  const stop_instance = () => {
    if (!fnrz.worker) return;
    fnrz.worker.remove_external_worker(ins.uuid, ins.nodeclassid);
  };

  const save_instance = () => {
    if (!fnrz.worker) return;
    fnrz.worker.update_external_worker(ins.uuid, ins.nodeclassid, {
      name: tempName,
    });
    ins.name = tempName;
  };

  return (
    <>
      <CustomDialog
        title={ins.name}
        description={"Settings for" + ins.name}
        trigger={<div>Settings</div>}
        buttons={[
          {
            text: "Save",
            onClick: save_instance,
            close: true,
          },
          {
            text: "Delete",
            onClick: stop_instance,
            close: true,
          },
        ]}
      >
        <div>
          <div>
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              name="name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="styledinput"
            />
          </div>
        </div>
      </CustomDialog>
    </>
  );
};

const ExternalWorkerInstanceEntry = ({
  ins,
  lib,
  filter = "",
}: {
  ins: ExternalWorkerInstance;
  lib?: Shelf;
  filter?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const filterednodes = lib?.nodes?.filter((node) =>
    node.node_id.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="shelfcontainer">
      <div
        className="shelftitle"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
        title={ins.name}
      >
        <div className="shelftitle_text">{ins.name}</div>
        <div className={"expandicon " + (isOpen ? "open" : "close")}>
          <ExpandLessIcon />
        </div>
      </div>
      <div className={"libnodecontainer " + (isOpen ? "open" : "close")}>
        <div className="libnodecontainer_inner">
          {isOpen && (
            <>
              <div className="libnodeentry" title={ins.uuid}>
                <ExternalWorkerInstanceSettings ins={ins} />
              </div>
              {lib && (
                <>
                  {filterednodes && (
                    <>
                      {filterednodes.map((subItem, idx) => (
                        <LibraryNode key={idx} item={subItem} />
                      ))}
                    </>
                  )}
                  {lib.subshelves.map((subItem, idx) => (
                    <LibraryShelf key={idx} item={subItem} filter={filter} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ExternalWorkerClassEntry = ({
  item,
  mod,
  lib,
}: {
  item: ExternalWorkerClassDep;
  mod: string;
  lib?: Shelf;
}) => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const add_to_flow = () => {
    zustand.worker?.add_external_worker({
      module: mod,
      cls_module: item.module,
      cls_name: item.class_name,
    });
  };

  const click_new_instance = (event: MouseEvent<HTMLDivElement>) => {
    // if double click, add node to graph
    if (event.detail === 2) {
      add_to_flow();
    }
  };

  const title = item.name || item.module + "." + item.class_name;
  return (
    <div className="shelfcontainer">
      <div
        className="shelftitle"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
        title={title}
      >
        <div className="shelftitle_text">{title}</div>
        <div className={"expandicon " + (isOpen ? "open" : "close")}>
          <ExpandLessIcon />
        </div>
      </div>
      <div className={"libnodecontainer " + (isOpen ? "open" : "close")}>
        <div className="libnodecontainer_inner">
          {isOpen && (
            <>
              <div
                className="libnodeentry"
                onClick={click_new_instance}
                title={item.name}
              >
                New Instance
              </div>
              {item.instances.map((instance, idx) => (
                <ExternalWorkerInstanceEntry
                  key={idx}
                  ins={instance}
                  lib={lib?.subshelves.find(
                    (shelf) => shelf.name === instance.uuid
                  )}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
const ExternalWorkerShelf = ({
  externalworkermod,
  lib,
}: {
  externalworkermod: ExternalWorkerDependencies;
  lib?: Shelf;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const _isopen = isOpen;

  return (
    <div className="shelfcontainer">
      <div
        className="shelftitle"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
        title={externalworkermod.module}
      >
        <div className="shelftitle_text">{externalworkermod.module}</div>
        <div className={"expandicon " + (_isopen ? "open" : "close")}>
          <ExpandLessIcon />
        </div>
      </div>
      <div className={"libnodecontainer " + (_isopen ? "open" : "close")}>
        <div className="libnodecontainer_inner">
          {externalworkermod.worker_classes.map((subItem, idx) => (
            <ExternalWorkerClassEntry
              key={idx}
              item={subItem}
              mod={externalworkermod.module}
              lib={lib}
            />
          ))}
        </div>
      </div>
      <hr />
    </div>
  );
};

const Library = () => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const libstate = zustand.lib.libstate();

  const [filter, setFilter] = useState("");

  return (
    <div className="libcontainer">
      <div className="library">
        <div className="libtitle">Lib</div>
        <hr className="hr_prominent" />
        <LibFilter filter={filter} setFilter={setFilter} />
        <div className="vscrollcontainer">
          {libstate.lib.shelves.map((item, idx) =>
            item.name == "_external_worker" ? (
              <></>
            ) : (
              <LibraryShelf key={idx} item={item} filter={filter} />
            )
          )}
        </div>
        <hr />
        <div className="libtitle">External Worker</div>
        <hr className="hr_prominent" />
        <div className="vscrollcontainer">
          {libstate.external_worker?.map((item, idx) => (
            <ExternalWorkerShelf
              key={idx}
              externalworkermod={item}
              lib={libstate.lib.shelves.find(
                (shelf) => shelf.name === "_external_worker"
              )}
            ></ExternalWorkerShelf>
          ))}
        </div>
        <hr />
      </div>
      <div style={{ paddingTop: "0.5rem" }}></div>
      <div className="addlib">
        <AddLibraryOverLay>
          <button disabled={zustand.worker === undefined}>
            Manage Libraries
          </button>
        </AddLibraryOverLay>
      </div>
    </div>
  );
};

export default Library;
export { LibraryShelf as LibraryItem };
