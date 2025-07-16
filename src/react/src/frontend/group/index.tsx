import * as React from "react";
import { useContext } from "react";
import { removeGroup } from "../../utils/grouping";
import { FuncNodesContext } from "../funcnodesreactflow";
import { CloseIcon } from "../assets/fontawsome";

// The default Node rendering component for groups
export const DefaultGroup = ({ data }: { data: any }) => {
  const fnrf_zst = useContext(FuncNodesContext);
  const groupId = data?.group?.id || data?.id;
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (groupId) {
      removeGroup([groupId], fnrf_zst);
    }
  };
  return (
    <div className="fn-group">
      <button
        className="fn-group-remove"
        title="Remove group"
        onClick={handleRemove}
      >
        <CloseIcon />
      </button>
      Group
    </div>
  );
};
