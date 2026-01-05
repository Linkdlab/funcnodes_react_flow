import * as React from "react";
import { useIOStore } from "@/nodes";
import { useIOSetHidden } from "@/nodes-io-hooks";

export const NodeSettingsOutput = () => {
  const iostore = useIOStore();
  const io = iostore.use();
  const set_hidden = useIOSetHidden();
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
              set_hidden?.(e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};
