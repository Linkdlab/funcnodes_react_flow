import * as React from "react";
import { useState } from "react";
import {
  AvailableModule,
  Restriction,
  POSSIBLE_RESTRICTIONS,
  DEFAULT_RESTRICTION,
} from "./types";

export const VersionSelector = ({
  availableModule,
  on_change,
}: {
  availableModule: AvailableModule;
  on_change: (release: string) => void;
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    availableModule.version || "latest"
  );

  const [selectedRestriction, setSelectedRestriction] =
    useState<Restriction>(DEFAULT_RESTRICTION);

  const updateSelectedRelease = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const version = e.target.value;
    setSelectedRelease(version);
    if (version !== "latest") on_change(selectedRestriction + version);
    else on_change(version);
  };

  const updateSelectedRestriction = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (e.target.value === selectedRestriction) return;
    if (!POSSIBLE_RESTRICTIONS.includes(e.target.value as Restriction)) return;
    setSelectedRestriction(e.target.value as Restriction);
    if (selectedRelease !== "latest")
      on_change(e.target.value + selectedRelease);
  };

  // if availableModule.version is set and not in availableModule.releases, add it to the beginning of the list
  if (
    availableModule.releases &&
    !availableModule.releases.includes(selectedRelease)
  ) {
    availableModule.releases.unshift(selectedRelease);
  }
  return (
    <>
      <select value={selectedRestriction} onChange={updateSelectedRestriction}>
        {POSSIBLE_RESTRICTIONS.map((restriction) => (
          <option key={restriction} value={restriction}>
            {restriction}
          </option>
        ))}
      </select>
      <select onChange={updateSelectedRelease} value={selectedRelease}>
        {availableModule["releases"] &&
          availableModule["releases"].map((release: string) => (
            <option key={release} value={release}>
              {release}
            </option>
          ))}
      </select>
    </>
  );
};
