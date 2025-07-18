import * as React from "react";
import { useState } from "react";
import { useFuncNodesContext } from "@/providers";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@/icons";
import {
  currentBreakpointSmallerThan,
  ExpandingContainer,
} from "@/shared-components/auto-layouts";
import { FuncNodesReactFlowZustandInterface } from "@/barrel_imports";
import {
  LibraryItem,
  LibraryFilter,
  AddLibraryOverlay,
  ExternalWorkerShelf,
} from "./components";

export const Library = () => {
  const zustand: FuncNodesReactFlowZustandInterface = useFuncNodesContext();
  const libstate = zustand.lib.libstate();

  const fnrf_zst = useFuncNodesContext();
  const expanded = fnrf_zst.local_settings(
    (state) => state.view_settings.expand_lib
  );

  const update_view_settings = fnrf_zst.local_settings(
    (state) => state.update_view_settings
  );

  const set_expand_lib = (expand: boolean) => {
    update_view_settings({ expand_lib: expand });
  };

  const on_small_screen = currentBreakpointSmallerThan("m");

  const [filter, setFilter] = useState("");
  const worker_isopen =
    zustand.worker?.state((s) => {
      return s.is_open;
    }) ?? false;

  return (
    <ExpandingContainer
      maxSize={on_small_screen ? "100%" : "18.75rem"}
      direction={on_small_screen ? "down" : "right"}
      containerClassName={`pos-left pos-top bg1 h-12`}
      onExpandChange={set_expand_lib}
      expanded={expanded === undefined ? true : expanded}
      collapseIcons={{
        up: ChevronDownIcon,
        down: ChevronUpIcon,
        left: ChevronRightIcon,
        right: ChevronLeftIcon,
      }}
      expandIcons={{
        up: ChevronUpIcon,
        down: ChevronDownIcon,
        left: ChevronLeftIcon,
        right: ChevronRightIcon,
      }}
    >
      <div className="libcontainer">
        <div className="library">
          <div className="libtitle">Lib</div>
          <hr className="hr_prominent" />
          <LibraryFilter filter={filter} setFilter={setFilter} />
          <div className="vscrollcontainer">
            {libstate.lib.shelves
              .filter((item) => item.name !== "_external_worker")
              .map((item) => (
                <LibraryItem
                  key={item.name}
                  item={item}
                  filter={filter}
                  parentkey={item.name}
                />
              ))}
          </div>
          <hr />
          <div className="libtitle">External Worker</div>
          <hr className="hr_prominent" />
          <div className="vscrollcontainer">
            {libstate.external_worker?.map((item) => (
              <ExternalWorkerShelf
                key={item.module}
                externalworkermod={item}
                lib={libstate.lib.shelves.find(
                  (shelf) => shelf.name === "_external_worker"
                )}
              />
            ))}
          </div>
          <hr />
        </div>
        {worker_isopen && (
          <div className="addlib">
            <AddLibraryOverlay>
              <button>Manage Libraries</button>
            </AddLibraryOverlay>
          </div>
        )}
      </div>
    </ExpandingContainer>
  );
};

export { LibraryItem } from "./components";
