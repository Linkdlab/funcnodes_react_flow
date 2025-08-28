import * as React from "react";
import { useState } from "react";
import { ExpandLessIcon } from "@/icons";

import { ExternalWorkerClassEntry } from "./ExternalWorkerClassEntry";
import { ExternalWorkerDependencies, Shelf } from "@/library";

export const ExternalWorkerShelf = ({
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
          {externalworkermod.worker_classes.map((subItem) => (
            <ExternalWorkerClassEntry
              key={subItem.module + subItem.class_name}
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
