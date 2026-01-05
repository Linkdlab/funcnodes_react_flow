import * as React from "react";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
} from "@/data-rendering-types";
import { IOStore } from "@/nodes-core";
import { useIOGetFullValue } from "@/nodes-io-hooks";

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
    <Component
      value={pendingValue} // currently rendered value
      preValue={displayValue} // new value, not yet swapped in
      onLoaded={handleLoaded} // callback to swap in the new value when ready
    />
  );
};

export const IOPreviewWrapper = ({
  Component,
}: {
  Component: DataPreviewViewRendererType;
}): React.JSX.Element => {
  return <Component />;
};
