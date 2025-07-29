import * as React from "react";
import { latest } from "@/barrel_imports";
import {
  DataOverlayRendererType,
  DataPreviewViewRendererType,
} from "@/data-rendering-types";

export const IODataOverlay = ({
  iostore,
  Component,
}: {
  Component: DataOverlayRendererType;
  iostore: latest.IOStore;
}): React.JSX.Element => {
  // State for the value currently being displayed
  const [displayValue, setDisplayValue] = React.useState<any>(undefined);
  // State for the new incoming value (pending)
  const [pendingValue, setPendingValue] = React.useState<any>(undefined);

  const { full } = iostore.valuestore();

  React.useEffect(() => {
    if (full === undefined) {
      iostore.getState().try_get_full_value();
    } else {
      // When a new value arrives, store it as pending
      setPendingValue(full.value);
    }
  }, [full]);

  // This callback will be triggered by the child component when it has loaded the new value
  const handleLoaded = () => {
    if (pendingValue !== undefined) {
      setDisplayValue(pendingValue);
    }
  };

  return (
    <Component
      iostore={iostore}
      value={pendingValue} // currently rendered value
      preValue={displayValue} // new value, not yet swapped in
      onLoaded={handleLoaded} // callback to swap in the new value when ready
    />
  );
};

export const IOPreviewWrapper = ({
  iostore,
  Component,
}: {
  Component: DataPreviewViewRendererType;
  iostore: latest.IOStore;
}): React.JSX.Element => {
  return <Component iostore={iostore} />;
};
