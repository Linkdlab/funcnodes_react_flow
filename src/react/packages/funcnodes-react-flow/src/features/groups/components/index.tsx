import * as React from "react";
import { useRemoveGroups } from "../hooks";
import { CloseIcon } from "@/icons";
import "./groups.scss";

export interface NodeGroup {
  node_ids: string[];
  child_groups: string[];
  parent_group: string | null;
  meta: Record<string, any>;
  position: [number, number];
}

export interface NodeGroups {
  [key: string]: NodeGroup;
}

// The default Node rendering component for groups
export const DefaultGroup = ({ data }: { data: any }) => {
  const groupId = data?.group?.id || data?.id;
  const removeGroups = useRemoveGroups();
  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (groupId) {
        removeGroups([groupId]);
      }
    },
    [groupId, removeGroups]
  );
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
