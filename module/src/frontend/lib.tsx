import React, { useState, useContext } from "react";
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

const AddLibraryOverLay = ({ children }: { children: React.ReactNode }) => {
  const [newlib, setNewLib] = useState("");
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const [availableModules, SetAvailableModules] = useState([]);
  const update_modules = () => {
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
  return (
    <CustomDialog
      title="Add Library"
      trigger={children}
      description="Add a new library to the current worker."
      onOpenChange={update_modules}
      buttons={[
        {
          text: "add",
          onClick: add_new_lib,
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
            <button disabled={zustand.worker === undefined}>Add Library</button>
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
