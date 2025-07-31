import * as React from "react";
import { useState } from "react";
import { useFuncNodesContext } from "@/providers";
import { CustomDialog } from "@/shared-components";
import { useWorkerApi } from "@/workers";
import { ExternalWorkerInstance } from "@/library";

export const ExternalWorkerInstanceSettings = ({
  ins,
}: {
  ins: ExternalWorkerInstance;
}) => {
  const [tempName, setTempName] = useState(ins.name);
  const fnrz = useFuncNodesContext();
  const { lib: libAPI } = useWorkerApi();

  const stop_instance = () => {
    if (!fnrz.worker) return;
    libAPI?.remove_external_worker(ins.uuid, ins.nodeclassid);
  };

  const save_instance = () => {
    if (!fnrz.worker) return;
    fnrz.worker.update_external_worker(ins.uuid, ins.nodeclassid, {
      name: tempName,
    });
    ins.name = tempName;
  };

  return (
    <>
      <CustomDialog
        title={ins.name}
        description={"Settings for" + ins.name}
        trigger={<div>Settings</div>}
        buttons={[
          {
            text: "Save",
            onClick: save_instance,
            close: true,
          },
          {
            text: "Delete",
            onClick: stop_instance,
            close: true,
          },
        ]}
      >
        <div>
          <div>
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              name="name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="styledinput"
            />
          </div>
        </div>
      </CustomDialog>
    </>
  );
};
