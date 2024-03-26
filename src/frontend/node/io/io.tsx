import * as Tooltip from "@radix-ui/react-tooltip";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import "./io.scss";
import { Handle, HandleProps } from "reactflow";
import { useState } from "react";
import CustomDialog from "../../dialog";
const pick_best_io_type = (iot: SerializedType): string | undefined => {
  // check if iot is string
  if (typeof iot === "string") {
    return iot;
  }
  if ("allOf" in iot && iot.allOf !== undefined) {
    return undefined;
  }
  if ("anyOf" in iot && iot.anyOf !== undefined) {
    const picks = iot.anyOf.map(pick_best_io_type);
    if (picks.includes("enum")) {
      return "enum";
    }
    if (picks.includes("float")) {
      return "float";
    }
    if (picks.includes("int")) {
      return "int";
    }
    if (picks.includes("string") || picks.includes("str")) {
      return "string";
    }

    return undefined;
  }
  if (!("type" in iot) || iot.type === undefined) {
    return undefined;
  }

  if (iot.type === "enum") {
    return "enum";
  }
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
                {preview && (
                  <CustomDialog
                    trigger={<FullscreenIcon />}
                    onOpenChange={(open: boolean) => {
                      if (open) {
                        io.try_get_full_value();
                      }
                      setLocked(open);
                    }}
                  >
                    {preview({ io })}
                  </CustomDialog>
                )}
              </div>
              {preview
                ? preview({ io })
                : `no preview available for "${typestring}"`}
            </div>
            <Tooltip.Arrow className="iotooltipcontentarrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
export { pick_best_io_type, HandleWithPreview };
