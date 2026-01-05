// import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";
import { Handle, HandleProps } from "@xyflow/react";
import * as React from "react";
import { useState } from "react";
import { usePreviewHandleDataRendererForIo } from "./handle_renderer";

import { LockIcon, LockOpenIcon, FullscreenIcon } from "@/icons";
import { IODataOverlay, IOPreviewWrapper } from "./iodataoverlay";
import { useFuncNodesContext } from "@/providers";
import { CustomDialog } from "@/shared-components";
import { IOType } from "@/nodes-core";
import { useIOStore } from "@/nodes";
import { useIOGetFullValue } from "@/nodes-io-hooks";
import { pick_best_io_type } from "../../../pick_best_io_type";


type HandleWithPreviewProps = {
  typestring: string | undefined;
  preview?: React.FC<{ io: IOType }>;
} & HandleProps;

const HandleWithPreview = ({
  typestring,
  preview,
  ...props
}: HandleWithPreviewProps) => {
  const [locked, setLocked] = useState(false);
  const [opened, setOpened] = useState(false);
  const fnrf_zst = useFuncNodesContext();
  const iostore = useIOStore();
  const io = iostore.use();
  const get_full_value = useIOGetFullValue();

  const [pvhandle, overlayhandle] = usePreviewHandleDataRendererForIo(io);

  const portal = fnrf_zst.local_state(() => fnrf_zst.reactflowRef);

  return (
    // <Tooltip.Provider>
    <Popover.Root open={locked || opened} onOpenChange={setOpened}>
      <Popover.Trigger asChild>
        <Handle id={io.id} {...{ "data-type": typestring }} {...props} />
      </Popover.Trigger>
      <Popover.Portal container={portal}>
        <Popover.Content
          className={"iotooltipcontent"}
          sideOffset={5}
          // side="top"
          // align="center"
          avoidCollisions={true}
          collisionBoundary={portal}
          collisionPadding={10}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="iotooltip_container">
            <div className="iotooltip_header">
              {io.name}
              {locked ? (
                <LockIcon onClick={() => setLocked(false)} />
              ) : (
                <LockOpenIcon onClick={() => setLocked(true)} />
              )}
              {overlayhandle && (
                <CustomDialog
                  title={io.full_id}
                  trigger={<FullscreenIcon />}
                  onOpenChange={(open: boolean) => {
                    if (open) {
                      get_full_value?.();
                    }
                    setLocked(open);
                  }}
                >
                  {
                    <IODataOverlay
                      Component={overlayhandle}
                      iostore={iostore}
                    />
                  }
                </CustomDialog>
              )}
            </div>
            {pvhandle ? (
              <IOPreviewWrapper Component={pvhandle} />
            ) : (
              `no preview available for "${typestring}"`
            )}
          </div>
          <Popover.Arrow className="iotooltipcontentarrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
    // </Tooltip.Provider>
  );
};
export { pick_best_io_type, HandleWithPreview };
