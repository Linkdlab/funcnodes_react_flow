import * as React from "react";
import { useState } from "react";
import { AvailableModule, DEFAULT_RESTRICTION } from "./types";
import { ModuleLinks } from "./ModuleLinks";
import { ModuleDescription } from "./ModuleDescription";
import { VersionSelector } from "./VersionSelector";

export const AddableModule = ({
  availableModule,
  on_add,
}: {
  availableModule: AvailableModule;
  on_add: (module: AvailableModule, release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    DEFAULT_RESTRICTION + availableModule.version || "latest"
  );

  return (
    <div className="addable-module">
      <div className="module-name">
        {availableModule["name"] +
          (availableModule.version ? ` (${availableModule.version})` : "")}
      </div>
      <ModuleLinks availableModule={availableModule} />
      <ModuleDescription availableModule={availableModule} />
      <div>
        <VersionSelector
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
