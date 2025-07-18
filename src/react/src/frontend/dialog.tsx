import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { CloseIcon } from "@/icons";
import { useFuncNodesContext } from "@/providers";

export interface CustomDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  closebutton?: boolean;
  modal?: boolean;
  dialogClassName?: string;
  onOpenChange?: (open: boolean) => void;
  buttons?: {
    text: string;
    onClick: () => void;
    close?: boolean;
  }[];

  open?: boolean;
  setOpen?: (open: boolean) => void;
}
export const CustomDialog = ({
  trigger,
  title,
  description,
  children,
  closebutton = true,
  onOpenChange,
  buttons = [],
  open,
  setOpen,
  modal = true,
  dialogClassName = "defaultdialogcontent",
}: CustomDialogProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (setOpen) {
      setOpen(isOpen);
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };
  const fnrf_zst = useFuncNodesContext();
  const portal = fnrf_zst.local_state((state) => state.funcnodescontainerRef);

  const content = (
    <Dialog.Content asChild>
      <div className={"dialogconent funcnodescontainer " + dialogClassName}>
        {title && <Dialog.Title className="dialogtitle">{title}</Dialog.Title>}
        {description && (
          <Dialog.Description className="dialogdescription">
            {description}
          </Dialog.Description>
        )}
        <div className="dialogchildren">{children}</div>
        <div
          style={{
            display: "flex",
            marginTop: 25,
            justifyContent: "flex-end",
          }}
        >
          {(buttons || []).map((button, index) => (
            <Dialog.Close asChild key={index}>
              <button className="dialogsendbutton" onClick={button.onClick}>
                {button.text}
              </button>
            </Dialog.Close>
          ))}
        </div>
        {closebutton && (
          <Dialog.Close asChild>
            <button className="dialogclosebutton" aria-label="Close">
              <CloseIcon />
            </button>
          </Dialog.Close>
        )}
      </div>
    </Dialog.Content>
  );
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal container={portal}>
        <Dialog.Overlay className="dialogoverlay funcnodescontainer" />
        {content}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
