import { IOType } from "@/nodes-core";
import { useWorkerApi } from "@/workers";
import * as React from "react";

export const useSetIOValue = (io: IOType) => {
  const { node } = useWorkerApi();

  const func = React.useCallback(
    (value: any, set_default?: boolean) => {
      node?.set_io_value({
        nid: io.node,
        ioid: io.id,
        value: value,
        set_default:
          set_default == undefined
            ? io.render_options.set_default
            : set_default,
      });
    },
    [io, node]
  );

  return func;
};
