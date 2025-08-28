import * as React from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AvailableModule } from "./types";

export const ModuleDescription = ({
  availableModule,
}: {
  availableModule: AvailableModule;
}) => {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const toggleDescription = () => setExpandedDescription(!expandedDescription);
  const maxDescriptionLength = 150; // Max character length before truncating the description.

  const truncatedDescription =
    availableModule["description"].length > maxDescriptionLength
      ? availableModule["description"].substring(0, maxDescriptionLength) +
        "..."
      : availableModule["description"];

  return (
    <div className="module-description">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {expandedDescription
          ? availableModule["description"].replace(/\\n/g, "  \n")
          : truncatedDescription.replace(/\\n/g, "  \n")}
      </ReactMarkdown>
      {availableModule["description"].length > maxDescriptionLength && (
        <button onClick={toggleDescription} className="toggle-description">
          {expandedDescription ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};
