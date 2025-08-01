import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MenuRoundedIcon } from "@/icons";
import { AppearanceDialogContent } from "./settingsmenu_appearance";
import { FloatContainer } from "@/shared-components/auto-layouts";
import { CustomDialog } from "@/shared-components";

export const SettingsMenu = () => {
  const [appearanceOpen, setAppearanceOpen] = React.useState(false);

  const handleAppearance = () => {
    setAppearanceOpen(true);
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
    </>
  );
};
