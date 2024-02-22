import React, { useState, useContext } from "react";
import "./lib.scss";

import { Shelf, LibNode } from "../state/lib";
import { FuncNodesReactFlowZustandInterface } from "../state";
import { UseBoundStore } from "zustand";
import { MouseEvent } from "react";
import { FuncNodesContext } from "./index";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const LibraryShelf = ({ item, filter }: { item: Shelf; filter: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const filterednodes = item.nodes?.filter((node) =>
    node.node_id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="shelfcontainer">
      <div
        className="shelftitle"
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
        title={item.description}
      >
        <div className="shelftitle_text">{item.name}</div>
        <div className={"expandicon " + (isOpen ? "open" : "close")}>
          <ExpandLessIcon />
        </div>
      </div>

      {filterednodes && (
        <div className={"libnodecontainer " + (isOpen ? "open" : "close")}>
          <div className="libnodecontainer_inner">
            {filterednodes.map((subItem, idx) => (
              <LibraryNode key={idx} item={subItem} />
            ))}
          </div>
        </div>
      )}
      {item.subshelves && (
        <div style={{ marginLeft: 20 }}>
          {item.subshelves.map((subItem, idx) => (
            <LibraryShelf key={idx} item={subItem} filter={filter} />
          ))}
        </div>
      )}
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
const Library = () => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const libstate = zustand.lib.libstate((state) => state.state);

  const [filter, setFilter] = useState("");

  return (
    <div className="libcontainer">
      <div className="library">
        <div className="libtitle">Lib</div>
        <hr className="hr_prominent" />
        <LibFilter filter={filter} setFilter={setFilter} />
        <div className="vscrollcontainer">
          {libstate.shelves.map((item, idx) => (
            <LibraryShelf key={idx} item={item} filter={filter} />
          ))}
        </div>
        <hr />
      </div>
    </div>
  );
};

export default Library;
export { LibraryShelf as LibraryItem };
