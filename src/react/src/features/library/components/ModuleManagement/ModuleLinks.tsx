import * as React from "react";
import { AvailableModule } from "./types";

export const ModuleLinks = ({
  availableModule,
}: {
  availableModule: AvailableModule;
}) => {
  return (
    <div className="module-links">
      {availableModule.homepage && (
        <>
          <a
            href={availableModule["homepage"]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Homepage
          </a>
        </>
      )}
      {availableModule.source && availableModule.homepage && " | "}
      {availableModule.source && (
        <>
          <a
            href={availableModule["source"]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>
        </>
      )}
    </div>
  );
};
