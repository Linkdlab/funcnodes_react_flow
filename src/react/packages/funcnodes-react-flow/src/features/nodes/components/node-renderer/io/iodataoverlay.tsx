import * as React from "react";
import type {
  DataOverlayRendererProps,
  DataOverlayRendererType,
  DataPreviewViewRendererType,
} from "@/data-rendering-types";
import type { IOStore } from "@/nodes-core";
import {
  FallbackDataPreviewViewRenderer,
  FallbackOverlayRenderer,
} from "@/data-rendering";
import { useIOGetFullValue } from "@/nodes-io-hooks";
import {
  ErrorBoundary,
  type BaseFallbackProps,
} from "@/shared-components/error-boundary";

type OverlayFallbackProps = BaseFallbackProps & DataOverlayRendererProps;

const OverlayFallback = ({
  error: _error,
  ...props
}: OverlayFallbackProps) => <FallbackOverlayRenderer {...props} />;

const PreviewFallback = ({ error: _error }: BaseFallbackProps) => (
  <FallbackDataPreviewViewRenderer />
);

export const IODataOverlay = ({
  iostore,
  Component,
}: {
  Component: DataOverlayRendererType;
  iostore: IOStore;
}): React.JSX.Element => {
  // State for the value currently being displayed
  const [displayValue, setDisplayValue] = React.useState<any>(undefined);
  // State for the new incoming value (pending)
  const [pendingValue, setPendingValue] = React.useState<any>(undefined);

  const { full } = iostore.valuestore();
  const get_full_value = useIOGetFullValue();

  React.useEffect(() => {
    if (full === undefined) {
      get_full_value?.();
    } else {
      // When a new value arrives, store it as pending
      setPendingValue(full.value);
    }
  }, [full, get_full_value]);

  // This callback will be triggered by the child component when it has loaded the new value
  const handleLoaded = () => {
    if (pendingValue !== undefined) {
      setDisplayValue(pendingValue);
    }
  };

  return (
    <ErrorBoundary<OverlayFallbackProps>
      fallback={OverlayFallback}
      value={pendingValue}
      preValue={displayValue}
      onLoaded={handleLoaded}
    >
      <Component
        value={pendingValue} // currently rendered value
        preValue={displayValue} // new value, not yet swapped in
        onLoaded={handleLoaded} // callback to swap in the new value when ready
      />
    </ErrorBoundary>
  );
};

export const IOPreviewWrapper = ({
  Component,
}: {
  Component: DataPreviewViewRendererType;
}): React.JSX.Element => {
  return (
    <ErrorBoundary<BaseFallbackProps> fallback={PreviewFallback}>
      <Component />
    </ErrorBoundary>
  );
};
