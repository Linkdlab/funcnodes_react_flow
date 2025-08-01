import * as React from "react";
import { useState } from "react";
import { ExpandLessIcon } from "@/icons";
import { LibraryNode, LibraryItem } from "@/library/components";
import { ExternalWorkerInstanceSettings } from "./ExternalWorkerInstanceSettings";
import { ExternalWorkerInstance, Shelf } from "@/library";

export const ExternalWorkerInstanceEntry = ({
  ins,
  lib,
  filter = "",
  parentkey,
}: {
  ins: ExternalWorkerInstance;
  lib?: Shelf;
  filter?: string;
  parentkey: string;
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
                      {filterednodes.map((subItem) => (
                        <LibraryNode
                          key={parentkey + subItem.node_id}
                          item={subItem}
                        />
                      ))}
                    </>
                  )}
                  {lib.subshelves.map((subItem) => (
                    <LibraryItem
                      key={parentkey + subItem.name}
                      item={subItem}
                      filter={filter}
                      parentkey={parentkey + subItem.name}
                    />
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
