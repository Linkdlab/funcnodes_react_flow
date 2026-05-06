import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MenuRoundedIcon } from "@/icons";
import { AppearanceDialogContent } from "./settingsmenu_appearance";
import { WorkerSettingsDialogContent } from "./settingsmenu_worker";
import { FloatContainer } from "@/shared-components/auto-layouts";
import { CustomDialog } from "@/shared-components";
import { useFuncNodesContext } from "@/providers";

export const SettingsMenu = () => {
  const fnrf_zst = useFuncNodesContext();
  const workerstate = fnrf_zst.workerstate();
  const [appearanceOpen, setAppearanceOpen] = React.useState(false);
  const [workerOpen, setWorkerOpen] = React.useState(false);
  const hasWorker = Boolean(fnrf_zst.worker && workerstate.is_open);

  const handleAppearance = () => {
    setAppearanceOpen(true);
  };

  const handleWorker = () => {
    setWorkerOpen(true);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="styledbtn">
            <FloatContainer direction="row">
              Settings <MenuRoundedIcon className="m-x-s" />
            </FloatContainer>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="headermenucontent funcnodescontainer">
          <DropdownMenu.Group>
            <DropdownMenu.Item
              className="headermenuitem"
              onClick={handleAppearance}
            >
              Appearance
            </DropdownMenu.Item>
            {hasWorker && (
              <DropdownMenu.Item
                className="headermenuitem"
                onClick={handleWorker}
              >
                Worker
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <CustomDialog
        open={appearanceOpen}
        setOpen={setAppearanceOpen}
        title="Appearance"
        description="Change the color theme."
        closebutton
      >
        <AppearanceDialogContent />
      </CustomDialog>
      <CustomDialog
        open={workerOpen}
        setOpen={setWorkerOpen}
        title="Worker"
        description="Edit worker settings."
        closebutton
      >
        <WorkerSettingsDialogContent setOpen={setWorkerOpen} />
      </CustomDialog>
    </>
  );
};
