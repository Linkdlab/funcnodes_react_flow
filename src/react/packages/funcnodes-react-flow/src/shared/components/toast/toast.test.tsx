// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { Toasts, useToast } from "./toast";

const ToastTrigger: React.FC<{ onAction?: () => void }> = ({ onAction }) => {
  const toast = useToast();

  return (
    <div>
      <button
        onClick={() =>
          toast({
            title: "Default",
            description: "Default toast",
          })
        }
      >
        Add Default
      </button>
      <button
        onClick={() =>
          toast.success({
            title: "Success",
            description: "Success toast",
          })
        }
      >
        Add Success
      </button>
      <button
        onClick={() =>
          toast({
            title: "Action",
            description: "Action toast",
            action: {
              label: "Undo",
              altText: "Undo action",
              onClick: () => onAction?.(),
            },
          })
        }
      >
        Add Action
      </button>
    </div>
  );
};

describe("toasts", () => {
  it("throws when useToast is used outside provider", () => {
    const Broken = () => {
      useToast();
      return null;
    };

    expect(() => render(<Broken />)).toThrow("useToast must be used within Toasts");
  });

  it("renders and stacks toasts with fixed height", async () => {
    render(
      <Toasts fixedHeight={80} maxVisible={1}>
        <ToastTrigger />
      </Toasts>
    );

    fireEvent.click(screen.getByText("Add Default"));
    fireEvent.click(screen.getByText("Add Success"));

    expect(await screen.findByText("Default toast")).toBeInTheDocument();
    expect(await screen.findByText("Success toast")).toBeInTheDocument();

    const toastRoots = document.querySelectorAll<HTMLElement>(".ToastRoot");
    expect(toastRoots.length).toBeGreaterThanOrEqual(2);

    const heights = Array.from(toastRoots).map((toast) =>
      toast.style.getPropertyValue("--height")
    );

    expect(heights[0]).toBe("80px");
    const hiddenToasts = Array.from(toastRoots).filter(
      (toast) => toast.getAttribute("data-hidden") === "true"
    );
    expect(hiddenToasts.length).toBeGreaterThanOrEqual(1);
  });

  it("handles action clicks and closes toasts", async () => {
    const actionSpy = vi.fn();

    render(
      <Toasts>
        <ToastTrigger onAction={actionSpy} />
      </Toasts>
    );

    fireEvent.click(screen.getByText("Add Action"));
    const actionButton = await screen.findByText("Undo");
    fireEvent.click(actionButton);

    expect(actionSpy).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText("Action toast")).toBeNull();
    });

    fireEvent.click(screen.getByText("Add Default"));
    await screen.findByText("Default toast");

    const closeButtons = screen.getAllByLabelText("Close");
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Default toast")).toBeNull();
    });
  });

});
