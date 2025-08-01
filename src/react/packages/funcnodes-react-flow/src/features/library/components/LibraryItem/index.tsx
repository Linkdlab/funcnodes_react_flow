import * as React from "react";
import { useState } from "react";
import { ExpandLessIcon } from "@/icons";
import { LibraryNode } from "@/library/components";
import { Shelf } from "@/library";

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

export const LibraryItem = ({
  item,
  filter,
  parentkey,
}: {
  item: Shelf;
  filter: string;
  parentkey: string;
}) => {
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
              {filterednodes.map((subItem) => (
                <LibraryNode key={subItem.node_id} item={subItem} />
              ))}
            </>
          )}
          {item.subshelves && (
            <>
              {item.subshelves.map((subItem) => (
                <LibraryItem
                  key={parentkey + subItem.name}
                  item={subItem}
                  filter={filter}
                  parentkey={parentkey + subItem.name}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
};
