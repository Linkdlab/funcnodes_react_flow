import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useFuncNodesContext } from "@/providers";
import { MenuRoundedIcon } from "@/icons";
import { FloatContainer } from "@/shared-components/auto-layouts";
import { FuncNodesReactFlow } from "@/funcnodes-context";

export const NodeSpaceMenu = () => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();

  const onNew = () => {
    const alert = window.confirm("Are you sure you want to start a new flow?");
    if (alert) {
      fnrf_zst.worker?.clear();
    }
  };

  const onSave = async () => {
    const data = await fnrf_zst.worker?.save();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const onOpen = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const contents = e.target?.result;
        if (!contents) return;
        const data = JSON.parse(contents as string);
        await fnrf_zst.worker?.load(data);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="styledbtn">
            <FloatContainer direction="row">
              Nodespace <MenuRoundedIcon className="m-x-s" />
            </FloatContainer>
          </button>
        </DropdownMenu.Trigger>
        {/* <DropdownMenu.Portal> */}
        <DropdownMenu.Content className="headermenucontent funcnodescontainer">
          <DropdownMenu.Group>
            <DropdownMenu.Item className="headermenuitem" onClick={onNew}>
              New
            </DropdownMenu.Item>
            <DropdownMenu.Item className="headermenuitem" onClick={onSave}>
              Save
            </DropdownMenu.Item>
            <DropdownMenu.Item className="headermenuitem" onClick={onOpen}>
              Load
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
        {/* </DropdownMenu.Portal> */}
      </DropdownMenu.Root>
    </>
  );
};
