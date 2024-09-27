import React, { useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./lib.scss";

import { FuncNodesReactFlowZustandInterface } from "../states/fnrfzst.t";
import { MouseEvent } from "react";
import { FuncNodesContext } from "./index";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CustomDialog from "./dialog";
import {
  ExternalWorkerClassDep,
  ExternalWorkerDependecies,
  LibNode,
  Shelf,
} from "../states/lib.t";

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
}

const ActiveModule = ({
  availableModule,
  on_remove,
}: {
  availableModule: availableModule;
  on_remove: (module: availableModule) => void;
}) => {
  return (
    <div className="addable-module">
      <div className="module-name">{availableModule["name"]}</div>
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
      <div className="module-description">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {availableModule["description"].replace(/\\n/g, "  \n")}
        </ReactMarkdown>
      </div>

      <button
        className="remove-button"
        onClick={() => {
          on_remove(availableModule);
        }}
      >
        Remove
      </button>
    </div>
  );
};

const AddableModule = ({
  availableModule,
  on_add,
}: {
  availableModule: availableModule;
  on_add: (module: availableModule) => void;
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
    <div className="addable-module">
      <div className="module-name">{availableModule["name"]}</div>
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

      <button
        className="add-button"
        onClick={() => {
          on_add(availableModule);
        }}
      >
        Add
      </button>
    </div>
  );
};

const AddLibraryOverLay = ({ children }: { children: React.ReactNode }) => {
  const [newlib, setNewLib] = useState("");
  const [filter, setFilter] = useState(""); // State for the filter input
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

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
    console.log("get available modules");
    if (zustand.worker === undefined) {
      return;
    }

    zustand.worker.get_available_modules().then((modules) => {
      console.log("modules", modules);
      SetAvailableModules(modules);
    });
  };
  console.log("availableModules", availableModules);

  if (!zustand.worker) {
    return <></>;
  }

  const add_new_lib = () => {
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib(newlib);
    setNewLib("");
  };

  const add_new_lib_from_installed = (module: availableModule) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib(module.name.replace("-", "_")); // use name as module name
  };

  const add_new_lib_from_installable = (module: availableModule) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_lib("pip://" + module.name); // use name as module name
  };

  const remove_lib_from_active = (module: availableModule) => {
    setIsDialogOpen(false);
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.remove_lib(module.name.replace("-", "_"));
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
      buttons={[
        {
          text: "add",
          onClick: add_new_lib,
          close: true,
        },
      ]}
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
        {installedModulesFiltered.length > 0 && <h3>Installed</h3>}
        {installedModulesFiltered.map((item, idx) => (
          <AddableModule
            key={idx}
            availableModule={item}
            on_add={add_new_lib_from_installed}
          />
        ))}

        {availableModulesFiltered.length > 0 && <h3>Available</h3>}
        {availableModulesFiltered.map((item, idx) => (
          <AddableModule
            key={idx}
            availableModule={item}
            on_add={add_new_lib_from_installable}
          />
        ))}
        {activeModulesFiltered.length > 0 && <h3>Active</h3>}
        {activeModulesFiltered.map((item, idx) => (
          <ActiveModule
            key={idx}
            availableModule={item}
            on_remove={remove_lib_from_active}
          />
        ))}
      </div>
      <input
        className="styledinput"
        type="text"
        value={newlib}
        onChange={(e) => {
          setNewLib(e.target.value);
        }}
      />
    </CustomDialog>
  );
};

const AddExternalWorkerOverLay = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [newlib, setNewLib] = useState("");
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  if (!zustand.worker) {
    return <></>;
  }
  const add_new_worker = () => {
    if (zustand.worker === undefined) {
      return;
    }
    zustand.worker.add_worker_package(newlib);
    setNewLib("");
  };
  return (
    <CustomDialog
      title="Add External Worker"
      trigger={children}
      description="Add external worker class(es) to the current worker."
      buttons={[
        {
          text: "add",
          onClick: add_new_worker,
          close: true,
        },
      ]}
    >
      <input
        className="styledinput"
        type="text"
        value={newlib}
        onChange={(e) => {
          setNewLib(e.target.value);
        }}
      />
    </CustomDialog>
  );
};

const ExternalWorkerClassEntry = ({
  item,
  mod,
}: {
  item: ExternalWorkerClassDep;
  mod: string;
}) => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const add_to_flow = () => {
    zustand.worker?.add_external_worker({
      module: mod,
      cls_module: item.module,
      cls_name: item.class_name,
    });
  };

  const nodeclick = (event: MouseEvent<HTMLDivElement>) => {
    // if double click, add node to graph
    if (event.detail === 2) {
      add_to_flow();
    }
  };
  return (
    <div className="libnodeentry" onClick={nodeclick} title={item.name}>
      {item.name || item.module + "." + item.class_name}
    </div>
  );
};
const ExternalWorkerShelf = ({
  externalworkermod,
}: {
  externalworkermod: ExternalWorkerDependecies;
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
          {libstate.lib.shelves.map((item, idx) => (
            <LibraryShelf key={idx} item={item} filter={filter} />
          ))}
        </div>
        <hr />

        <div className="addlib">
          <AddLibraryOverLay>
            <button disabled={zustand.worker === undefined}>
              Manage Libaries
            </button>
          </AddLibraryOverLay>
        </div>
      </div>
      <div style={{ paddingTop: "0.5rem" }}></div>
      <div className="library">
        <div className="libtitle">External Worker</div>
        <hr className="hr_prominent" />
        <div className="vscrollcontainer">
          {libstate.external_worker?.map((item, idx) => (
            <ExternalWorkerShelf
              key={idx}
              externalworkermod={item}
            ></ExternalWorkerShelf>
          ))}
        </div>
        <hr />
        <div className="addlib">
          <AddExternalWorkerOverLay>
            <button disabled={zustand.worker === undefined}>
              Add External Worker
            </button>
          </AddExternalWorkerOverLay>
        </div>
      </div>
    </div>
  );
};

export default Library;
export { LibraryShelf as LibraryItem };
