import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { CloseIcon } from "@/icons";
import { useFuncNodesContext } from "@/providers";

import "./CustomDialog.scss";

/**
 * Configuration for dialog action buttons
 */
export interface DialogButtonConfig {
  /** Button text content */
  text: string;
  /** Click handler function */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether clicking this button should close the dialog */
  close?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the button */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Props for the CustomDialog component
 */
export interface DialogProps {
  /** Element that triggers the dialog to open */
  trigger?: React.ReactNode;
  /** Dialog title displayed at the top */
  title?: string;
  /** Dialog description/subtitle */
  description?: string | React.ReactNode;
  /** Main content of the dialog */
  children: React.ReactNode;
  /** Whether to show the close button (X) in the top-right corner */
  closebutton?: boolean;
  /** Whether the dialog should be modal (blocking background interaction) */
  modal?: boolean;
  /** Additional CSS class names for the dialog container */
  dialogClassName?: string;
  /** Callback fired when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Array of action buttons to display at the bottom */
  buttons?: DialogButtonConfig[];
  /** Controlled open state */
  open?: boolean;
  /** Setter for controlled open state */
  setOpen?: (open: boolean) => void;
  /** ARIA label for the dialog */
  ariaLabel?: string;
  /** ARIA description for the dialog */
  ariaDescription?: string;
}

/**
 * Dialog button component for optimal performance
 */
const DialogButton = React.memo<{
  button: DialogButtonConfig;
  index: number;
}>(({ button, index }) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      button.onClick(event);
    },
    [button]
  );

  const ButtonComponent = (
    <button
      className={`dialog-send-button ${button.className || ""}`}
      onClick={handleClick}
      disabled={button.disabled}
      aria-label={button.ariaLabel}
      type="button"
    >
      {button.text}
    </button>
  );

  return button.close !== false ? (
    <Dialog.Close asChild key={index}>
      {ButtonComponent}
    </Dialog.Close>
  ) : (
    <React.Fragment key={index}>{ButtonComponent}</React.Fragment>
  );
});

DialogButton.displayName = "DialogButton";

/**
 * CustomDialog - A reusable modal dialog component built on Radix UI
 *
 * Features:
 * - Accessible by default with proper ARIA attributes
 * - Customizable appearance and behavior
 * - Support for action buttons
 * - Portal rendering for proper z-index management
 * - Performance optimized with React.memo and useMemo
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <CustomDialog
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   buttons={[
 *     { text: "Cancel", onClick: () => console.log("cancelled") },
 *     { text: "Confirm", onClick: () => console.log("confirmed") }
 *   ]}
 * >
 *   <p>This action cannot be undone.</p>
 * </CustomDialog>
 * ```
 */

export const CustomDialog = React.memo<DialogProps>(
  ({
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
    dialogClassName = "default-dialog-content",
    ariaLabel,
    ariaDescription,
  }) => {
    const fnrf_zst = useFuncNodesContext();
    const portal = fnrf_zst.local_state((state) => state.funcnodescontainerRef);

    // Optimize className concatenation
    const contentClassName = React.useMemo(
      () => `dialog-content funcnodescontainer ${dialogClassName}`,
      [dialogClassName]
    );

    // Memoize open change handler
    const handleOpenChange = React.useCallback(
      (isOpen: boolean) => {
        try {
          setOpen?.(isOpen);
          onOpenChange?.(isOpen);
        } catch (error) {
          console.error("Error in dialog open change handler:", error);
        }
      },
      [setOpen, onOpenChange]
    );

    // Memoize button elements with proper keys
    const buttonElements = React.useMemo(
      () =>
        buttons.map((button, index) => (
          <DialogButton
            key={`${button.text}-${index}`}
            button={button}
            index={index}
          />
        )),
      [buttons]
    );

    // Memoize dialog content

    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={modal}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal container={portal}>
          <Dialog.Overlay className="dialog-overlay funcnodescontainer" />
          <Dialog.Content asChild {...(!description ? { "aria-describedby": undefined } : {})}>
            <div
              className={contentClassName}
              role="dialog"
              aria-label={ariaLabel || title}
              aria-description={
                ariaDescription ||
                (typeof description === "string" ? description : undefined)
              }
            >
              <Dialog.Title
                className={`dialog-title${title ? "" : " dialog-title--visually-hidden"}`}
              >
                {title || ariaLabel || "Dialog"}
              </Dialog.Title>

              {description && (
                <Dialog.Description
                  className="dialog-description"
                >
                  {description}
                </Dialog.Description>
              )}
              <div className="dialog-children" role="main">
                {children}
              </div>
              {buttons.length > 0 && (
                <div
                  className="dialog-buttons"
                  role="group"
                  aria-label="Dialog actions"
                >
                  {buttonElements}
                </div>
              )}
              {closebutton && (
                <Dialog.Close asChild>
                  <button
                    className="dialog-close-button"
                    aria-label="Close dialog"
                    type="button"
                  >
                    <CloseIcon />
                  </button>
                </Dialog.Close>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

CustomDialog.displayName = "CustomDialog";
