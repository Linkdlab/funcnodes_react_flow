import { useState } from "react";
import { useFuncNodesContext } from "@/providers";
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MenuRoundedIcon, ChevronRightIcon } from "@/icons";
import { downloadBase64, fileDialogToBase64 } from "@/data-helpers";

import { CustomDialog } from "@/shared-components";
import { isDevelopment } from "@/utils/debugger";
import { FloatContainer } from "@/shared-components/auto-layouts";
import { FuncNodesReactFlow } from "@/funcnodes-context";

const NewWorkerDialog = ({
  trigger,
  setOpen,
  open,
}: {
  trigger?: React.ReactNode;
  setOpen: (open: boolean) => void;
  open?: boolean;
}) => {
  const [name, setName] = useState<string>("");
  const [inVenv, setInVenv] = useState<boolean>(true);
  // const [copyLib, setCopyLib] = useState<boolean>(false);
  // const [copyNS, setCopyNS] = useState<boolean>(false);
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();

  // const workersstate = fnrf_zst.workers();

  // const [reference, setReference] = useState<{ name: string; uuid: string }>({
  //   name: "None",
  //   uuid: "",
  // });

  if (!fnrf_zst.options.useWorkerManager) return null;

  return (
    <CustomDialog
      setOpen={setOpen}
      open={open}
      trigger={trigger}
      title="New Worker"
      description="Create a new worker"
    >
      <div>
        Name:
        <br />
        <input
          className="styledinput"
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
          value={name}
        />
        <div style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            id="inVenvCheckbox"
            checked={inVenv}
            onChange={(e) => setInVenv(e.currentTarget.checked)}
          />
          <label htmlFor="inVenvCheckbox" style={{ marginLeft: 4 }}>
            Create in new virtual environment
          </label>
        </div>
      </div>
      <div>
        {/* Optional: Slect a another worker as interpreter reference
          Reference Worker:
          <br />
          <select
            className="styleddropdown"
            onChange={(e) => {
              const uuid = e.target.value;
              const name = e.target.selectedOptions[0].innerText;
              setReference({ name, uuid });
            }}
            value={reference.uuid}
          >
            <option value="">None</option>
            {Object.keys(workersstate).map((workerid) => (
              <option className={""} key={workerid} value={workerid}>
                {workersstate[workerid].name || workerid}
              </option>
            ))}
          </select>
          {reference.uuid && (
            <div>
              <div>
                Copy Lib:{" "}
                <input
                  type="checkbox"
                  className="styledcheckbox"
                  checked={copyLib}
                  onChange={(e) => {
                    setCopyLib(e.currentTarget.checked);
                  }}
                />
              </div>
              {copyLib && (
                <div>
                  Copy Nodespace{" "}
                  <input
                    type="checkbox"
                    className="styledcheckbox"
                    checked={copyNS}
                    onChange={(e) => {
                      setCopyNS(e.currentTarget.checked);
                      if (e.currentTarget.checked) {
                        setCopyLib(true);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )} */}
        {name && (
          <div>
            <button
              className="styledbtn"
              onClick={() => {
                fnrf_zst.workermanager?.new_worker({
                  name,
                  in_venv: inVenv,
                  // reference: reference.uuid,
                  // copyLib,
                  // copyNS,
                });
                setOpen(false);
              }}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </CustomDialog>
  );
};

const ExportWorkerDialog = ({
  trigger,
  setOpen,
  open,
}: {
  trigger?: React.ReactNode;
  setOpen: (open: boolean) => void;
  open?: boolean;
}) => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();

  const [withFiles, setWithFiles] = useState<boolean>(false);
  const workersstate = fnrf_zst.workers();
  const workerid = fnrf_zst.worker?.uuid;
  const name =
    (workerid ? workersstate[workerid]?.name : undefined) ||
    workerid ||
    "worker";

  const exportWorker = async () => {
    if (!fnrf_zst.worker) return;
    const data = await fnrf_zst.worker.export({ withFiles });
    downloadBase64(data, name + ".fnw", "application/zip");
    setOpen(false);
  };

  return (
    <CustomDialog
      setOpen={setOpen}
      open={open}
      trigger={trigger}
      title="Export Worker"
      description="Export the worker as a .fnw file"
    >
      <div>
        <div>
          <input
            type="checkbox"
            className="styledcheckbox"
            checked={withFiles}
            onChange={(e) => {
              setWithFiles(e.currentTarget.checked);
            }}
          />
          Include Files
        </div>
        <button className="styledbtn" onClick={exportWorker}>
          Export
        </button>
      </div>
    </CustomDialog>
  );
};

export const WorkerMenu = () => {
  const fnrf_zst: FuncNodesReactFlow = useFuncNodesContext();
  const workersstate = fnrf_zst.workers();

  const [isNewWorkerDialogOpen, setNewWorkerDialogOpen] = useState(false);
  const [isExportWorkerDialogOpen, setExportWorkerDialogOpen] = useState(false);

  const workerselectchange = (workerid: string) => {
    if (workerid === "__select__") return;
    if (!fnrf_zst.workers) return;
    if (!fnrf_zst.workermanager) return;
    if (!workersstate[workerid]) return;
    if (!workersstate[workerid].active) {
      //create popup
      const ans = window.confirm(
        "this is an inactive worker, selecting it will start it, continue?"
      );
      if (!ans) return;
    }
    fnrf_zst.workermanager.set_active(workerid);
  };

  const updateWorker = async () => {
    if (!fnrf_zst.worker) return;
    // warn dialog
    const ans = window.confirm(
      "Updateing the worker might replace the current nodespace, continue?"
    );
    if (!ans) return;
    const data = await fileDialogToBase64(".fnw");
    fnrf_zst.worker.update_from_export(data);
  };

  const has_worker_manager =
    (fnrf_zst.options.useWorkerManager &&
      fnrf_zst.workermanager &&
      fnrf_zst.workermanager.open) ||
    isDevelopment();
  const show_select =
    has_worker_manager && Object.keys(workersstate).length > 0;

  const has_worker = fnrf_zst.worker && fnrf_zst.worker.is_open;
  const worker_restartable = has_worker && has_worker_manager;

  const show = has_worker_manager || has_worker;
  if (!show) return null;
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="styledbtn">
            <FloatContainer direction="row">
              Worker <MenuRoundedIcon className="m-x-s" />
            </FloatContainer>
          </button>
        </DropdownMenu.Trigger>
        {/* <DropdownMenu.Portal> */}
        <DropdownMenu.Content className="headermenucontent funcnodescontainer">
          <DropdownMenu.Group>
            {show_select && (
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="headermenuitem submenuitem">
                  <FloatContainer direction="row">
                    Select
                    <ChevronRightIcon />
                  </FloatContainer>
                </DropdownMenu.SubTrigger>
                {/* <DropdownMenu.Portal> */}
                <DropdownMenu.SubContent
                  className="headermenucontent funcnodescontainer"
                  sideOffset={2}
                  alignOffset={-5}
                >
                  <DropdownMenu.RadioGroup
                    value={fnrf_zst.worker?.uuid}
                    onValueChange={(value) => {
                      workerselectchange(value);
                    }}
                  >
                    {Object.keys(workersstate)
                      .sort((a, b) => {
                        // First, sort by active status (active workers come first)
                        if (workersstate[a]!.active && !workersstate[b]!.active)
                          return -1;
                        if (!workersstate[a]!.active && workersstate[b]!.active)
                          return 1;

                        // If both are active or both are inactive, sort by name or ID

                        const nameA = workersstate[a]!.name || a;
                        const nameB = workersstate[b]!.name || b;
                        return nameA.localeCompare(nameB);
                      })
                      .map((workerid) => (
                        <DropdownMenu.RadioItem
                          className={
                            "headermenuitem workerselectoption" +
                            (workersstate[workerid]?.active
                              ? " active"
                              : " inactive") +
                            " headermenuitem"
                          }
                          key={workerid}
                          value={workerid}
                          disabled={workerid === fnrf_zst.worker?.uuid}
                        >
                          {workersstate[workerid]?.name || workerid}
                        </DropdownMenu.RadioItem>
                      ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.SubContent>
                {/* </DropdownMenu.Portal> */}
              </DropdownMenu.Sub>
            )}
            {has_worker && (
              <>
                {worker_restartable && (
                  <DropdownMenu.Item
                    className="headermenuitem"
                    onClick={() => {
                      if (!fnrf_zst.worker) return;
                      if (!fnrf_zst.workermanager)
                        return fnrf_zst.logger.error("no workermanager");
                      fnrf_zst.workermanager?.restart_worker(
                        fnrf_zst.worker.uuid
                      );
                    }}
                  >
                    Restart
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  className="headermenuitem"
                  onClick={() => {
                    if (!fnrf_zst.worker) return;
                    fnrf_zst.worker.stop();
                  }}
                >
                  Stop
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="headermenuitem"
                  //onClick={exportWorker}
                  onClick={() => setExportWorkerDialogOpen(true)}
                >
                  Export
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="headermenuitem"
                  onClick={updateWorker}
                >
                  Update
                </DropdownMenu.Item>
              </>
            )}
            {has_worker_manager && (
              <>
                <DropdownMenu.Item
                  className="headermenuitem"
                  onClick={() => setNewWorkerDialogOpen(true)}
                >
                  New
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
        {/* </DropdownMenu.Portal> */}
      </DropdownMenu.Root>

      <NewWorkerDialog
        open={isNewWorkerDialogOpen}
        setOpen={setNewWorkerDialogOpen}
      ></NewWorkerDialog>
      <ExportWorkerDialog
        open={isExportWorkerDialogOpen}
        setOpen={setExportWorkerDialogOpen}
      ></ExportWorkerDialog>
    </>
  );
};
