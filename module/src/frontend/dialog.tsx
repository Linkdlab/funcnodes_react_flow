import React from "react";
import * as Dialog from "@radix-ui/react-dialog";


import "./dialog.scss";
import { CloseIcon } from "./assets/mui";
interface CustomDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  closebutton?: boolean;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttons?: {
    text: string;
    onClick: () => void;
    close?: boolean;
  }[];

  open?: boolean;
  setOpen?: (open: boolean) => void;
}
const CustomDialog = ({
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
}: CustomDialogProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (setOpen) {
      setOpen(isOpen);
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="dialogoverlay" />
        <Dialog.Content className="dialogconent">
          {title && (
            <Dialog.Title className="dialogtitle">{title}</Dialog.Title>
          )}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CustomDialog;
export type { CustomDialogProps };
