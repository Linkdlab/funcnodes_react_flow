import * as React from "react";
import { CustomDialog } from "@/barrel_imports";
import { latest } from "@/barrel_imports";
import { NodeSettingsWindow } from "./NodeSettingsWindow";

interface NodeSettingsOverlayProps {
  node_data: latest.NodeType;
  nodeSettingsPath: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NodeSettingsOverlay = ({
  node_data,
  isOpen,
  onOpenChange,
  nodeSettingsPath,
}: NodeSettingsOverlayProps) => {
  return (
    <CustomDialog
      title={`Node Settings: ${node_data.id}`}
      open={isOpen}
      onOpenChange={onOpenChange}
      dialogClassName="nodesettings-dialog"
    >
      <NodeSettingsWindow
        node_data={node_data}
        nodeSettingsPath={nodeSettingsPath}
      />
    </CustomDialog>
  );
};
