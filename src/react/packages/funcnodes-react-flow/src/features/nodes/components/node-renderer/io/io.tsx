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
import { IOType, RenderType } from "@/nodes-core";
import { DeepPartial } from "@/object-helpers";
import { useIOGetFullValue, useIOStore } from "@/nodes";

const pick_best_io_type = (
  io: IOType,
  typemap: { [key: string]: string | undefined }
): [string | undefined, string | undefined] => {
  return _inner_pick_best_io_type(io.render_options?.type ?? "any", typemap);
};

const _inner_pick_best_io_type = (
  iot: DeepPartial<RenderType>,
  typemap: { [key: string]: string | undefined }
): [string | undefined, string | undefined] => {
  // check if iot is string
  if (typeof iot === "string") {
    if (iot in typemap) {
      return [typemap[iot], iot];
    }
    return [iot, iot];
  }
  if ("allOf" in iot && iot.allOf !== undefined) {
    return [undefined, undefined];
  }
  if ("anyOf" in iot && iot.anyOf !== undefined) {
    const picks = iot.anyOf.map((x) =>
      _inner_pick_best_io_type(x || "any", typemap)
    );
    for (const pick of picks) {
      switch (pick[0]) {
        case "bool":
          return ["bool", pick[1]];
        case "enum":
          return ["enum", pick[1]];
        case "float":
          return ["float", pick[1]];
        case "int":
          return ["int", pick[1]];
        case "string":
          return ["string", pick[1]];
        case "str":
          return ["string", pick[1]];
      }
    }

    return [undefined, undefined];
  }
  if (!("type" in iot) || iot.type === undefined) {
    return [undefined, undefined];
  }

  if (iot.type === "enum") {
    return ["enum", "enum"];
  }
  return [undefined, undefined];
};

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
