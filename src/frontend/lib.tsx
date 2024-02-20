import React, { useState, useContext } from "react";
import "./lib.scss";

import { Shelf, LibNode } from "../state/lib";
import { FuncNodesReactFlowZustandInterface } from "../state";
import { UseBoundStore } from "zustand";
import { MouseEvent } from "react";
import { FuncNodesContext } from "./index";
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
    <div className="libnodeentry" onClick={nodeclick}>
      {item.node_id}
    </div>
  );
};

const LibraryShelf = ({ item }: { item: Shelf }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="shelfcontainer">
      <div onClick={handleToggle} style={{ cursor: "pointer" }}>
        {item.name}
      </div>
      {isOpen && item.nodes && (
        <div style={{ marginLeft: 20 }}>
          {item.nodes.map((subItem, idx) => (
            <LibraryNode key={idx} item={subItem} />
          ))}
        </div>
      )}
      {isOpen && item.subshelves && (
        <div style={{ marginLeft: 20 }}>
          {item.subshelves.map((subItem, idx) => (
            <LibraryShelf key={idx} item={subItem} />
          ))}
        </div>
      )}
    </div>
  );
};

const Library = () => {
  const zustand: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const libstate = zustand.lib.libstate((state) => state.state);

  return (
    <div className="libcontainer">
      <div className="library">
        {libstate.shelves.map((item, idx) => (
          <LibraryShelf key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Library;
export { LibraryShelf as LibraryItem };
