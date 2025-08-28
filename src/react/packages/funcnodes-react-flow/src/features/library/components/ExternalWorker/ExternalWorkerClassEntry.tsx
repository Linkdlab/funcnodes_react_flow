import * as React from "react";
import { useState, MouseEvent } from "react";
import { ExpandLessIcon } from "@/icons";
import { ExternalWorkerInstanceEntry } from "./ExternalWorkerInstanceEntry";
import { useWorkerApi } from "@/workers";
import { ExternalWorkerClassDep, Shelf } from "@/library";

export const ExternalWorkerClassEntry = ({
  item,
  mod,
  lib,
}: {
  item: ExternalWorkerClassDep;
  mod: string;
  lib?: Shelf;
}) => {
  const { lib: libAPI } = useWorkerApi();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const add_to_flow = React.useCallback(() => {
    libAPI?.add_external_worker({
      module: mod,
      cls_module: item.module,
      cls_name: item.class_name,
    });
  }, [libAPI, mod, item]);

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
              {item.instances.map((instance) => (
                <ExternalWorkerInstanceEntry
                  key={instance.uuid}
                  ins={instance}
                  lib={lib?.subshelves.find(
                    (shelf) => shelf.name === instance.uuid
                  )}
                  parentkey={instance.uuid}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
