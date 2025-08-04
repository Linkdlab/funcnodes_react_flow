import * as React from "react";
import { CustomDialog } from "@/shared-components";
import { NodeSettingsWindow } from "./NodeSettingsWindow";
import { useNodeStore } from "@/nodes";

interface NodeSettingsOverlayProps {
  nodeSettingsPath: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NodeSettingsOverlay = React.memo(
  ({ isOpen, onOpenChange, nodeSettingsPath }: NodeSettingsOverlayProps) => {
    const nodestore = useNodeStore();
    const id = nodestore.use((state) => state.id);
    return (
      <CustomDialog
        title={`Node Settings: ${id}`}
        open={isOpen}
        onOpenChange={onOpenChange}
        dialogClassName="nodesettings-dialog"
      >
        <NodeSettingsWindow nodeSettingsPath={nodeSettingsPath} />
      </CustomDialog>
    );
  }
);
