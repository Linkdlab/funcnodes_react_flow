import * as React from "react";
import { useState } from "react";
import { AvailableModule, DEFAULT_RESTRICTION } from "./types";
import { ModuleLinks } from "./ModuleLinks";
import { ModuleDescription } from "./ModuleDescription";
import { VersionSelector } from "./VersionSelector";

export const ActiveModule = ({
  availableModule,
  on_remove,
  on_update,
}: {
  availableModule: AvailableModule;
  on_remove: (module: AvailableModule) => void;
  on_update: (module: AvailableModule, release: string) => void;
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
          className="update-button"
          disabled={selectedRelease === availableModule.version}
          onClick={() => {
            on_update(availableModule, selectedRelease);
          }}
        >
          Update
        </button>
        <button
          className="remove-button"
          onClick={() => {
            on_remove(availableModule);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
