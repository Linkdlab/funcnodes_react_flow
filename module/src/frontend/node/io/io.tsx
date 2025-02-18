import * as Tooltip from "@radix-ui/react-tooltip";

import "./io.scss";
import { Handle, HandleProps } from "reactflow";
import React, { useState } from "react";
import CustomDialog from "../../dialog";
import { PreviewHandleDataRendererForIo } from "./handle_renderer";
import { IOType, SerializedType } from "../../../states/nodeio.t";
import { DynamicComponentLoader } from "../../datarenderer/rendermappings";
import { LockIcon, LockOpenIcon, FullscreenIcon } from "../../assets/mui";

const pick_best_io_type = (
  iot: SerializedType,
  typemap: { [key: string]: string }
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
    const picks = iot.anyOf.map((x) => pick_best_io_type(x, typemap));
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
  io: IOType;
  typestring: string | undefined;
  preview?: React.FC<{ io: IOType }>;
} & HandleProps;

const HandleWithPreview = ({
  io,
  typestring,
  preview,
  ...props
}: HandleWithPreviewProps) => {
  const [locked, setLocked] = useState(false);
  const [opened, setOpened] = useState(false);

  const [pvhandle, overlayhandle] = io
    ? PreviewHandleDataRendererForIo(io)
    : [undefined, undefined];

  return (
    <Tooltip.Provider>
      <Tooltip.Root open={locked || opened} onOpenChange={setOpened}>
        <Tooltip.Trigger asChild>
          <Handle id={io.id} {...props} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={"iotooltipcontent"} sideOffset={5}>
            <div className="iotooltip_container">
              <div className="iotooltip_header">
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
                        if (io.try_get_full_value) io.try_get_full_value();
                      }
                      setLocked(open);
                    }}
                  >
                    {
                      <DynamicComponentLoader
                        component={overlayhandle}
                        io={io}
                      />
                    }
                  </CustomDialog>
                )}
              </div>
              {pvhandle ? (
                <DynamicComponentLoader component={pvhandle} io={io} />
              ) : (
                `no preview available for "${typestring}"`
              )}
            </div>
            <Tooltip.Arrow className="iotooltipcontentarrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
export { pick_best_io_type, HandleWithPreview };
