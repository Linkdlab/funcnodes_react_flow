import * as React from "react";
import { IOContext } from "@/nodes";

export const NodeSettingsOutput = () => {
  const iostore = React.useContext(IOContext);
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
              io.set_hidden?.(e.target.checked);
            }}
            checked={io.hidden}
          ></input>
        </label>
      </div>
    </div>
  );
};
