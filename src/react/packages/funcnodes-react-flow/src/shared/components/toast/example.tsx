import * as React from "react";
import { Toasts, useToast } from "./index";

// Example component showing how to use the toast system
const ToastDemo: React.FC = () => {
  const toast = useToast();

  const showDefaultToast = () => {
    toast({
      description: "This is a default toast message.",
    });
  };

  const showSuccessToast = () => {
    toast.success({
      title: "Success!",
      description: "Your changes have been saved successfully.",
    });
  };

  const showErrorToast = () => {
    toast.error({
      title: "Error",
      description: "Something went wrong. Please try again.",
    });
  };

  const showActionToast = () => {
    toast({
      title: "Scheduled: Catch up",
      description: "Friday, February 10 at 5:57 PM",
      action: {
        label: "Undo",
        altText: "Goto schedule to undo",
        onClick: () => {
          toast.success({
            description: "Action undone!",
          });
        },
      },
    });
  };

  const showMultipleToasts = () => {
    // This will demonstrate the stacking system
    for (let i = 1; i <= 6; i++) {
      setTimeout(() => {
        toast({
          title: `Toast ${i}`,
          description: `This is toast number ${i}. Only 3 visible, hover to expand.`,
        });
      }, i * 300);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button onClick={showDefaultToast}>Show Default</button>
      <button onClick={showSuccessToast}>Show Success</button>
      <button onClick={showErrorToast}>Show Error</button>
      <button onClick={showActionToast}>Show with Action</button>
      <button onClick={showMultipleToasts}>Show Multiple (Stack Demo)</button>
    </div>
  );
};

// Usage in your app:
export const ToastExample: React.FC = () => {
  return (
    <Toasts duration={5000}>
      <ToastDemo />
    </Toasts>
  );
};

// In your main app, wrap with Toasts:
// import { Toasts } from '@/shared/components';
//
// function App() {
//   return (
//     <Toasts duration={5000}>
//       <YourAppContent />
//     </Toasts>
//   );
// }
