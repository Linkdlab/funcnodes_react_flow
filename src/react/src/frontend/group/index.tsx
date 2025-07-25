import * as React from "react";
import { removeGroup } from "@/barrel_imports";
import { useFuncNodesContext } from "@/providers";
import { CloseIcon } from "@/icons";

// The default Node rendering component for groups
export const DefaultGroup = ({ data }: { data: any }) => {
  const fnrf_zst = useFuncNodesContext();
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
