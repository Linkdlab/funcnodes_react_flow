import * as React from "react";
import { useIOStore } from "@/nodes";
import { io_set_hidden } from "@/nodes-core";

export const NodeSettingsOutput = () => {
  const iostore = useIOStore();
  const io = iostore.use();
  return (
    <div className="nodesettings_component">
      <div>{io.name}</div>
      <div>
        <label>
          hidden:
          <input
            className="styledcheckbox"
            type="checkbox"
            disabled={io.connected}
            onChange={(e) => {
              io_set_hidden(iostore, e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};
