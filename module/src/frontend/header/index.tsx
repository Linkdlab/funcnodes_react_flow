import { useContext, useState } from "react";
import {
  FuncNodesReactFlowZustandInterface,
  FuncnodesReactHeaderProps,
} from "../../states/fnrfzst.t";
import { FuncNodesContext } from "../funcnodesreactflow";

import "./header.scss";
import CustomDialog from "../dialog";
import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  base64ToBlob,
  downloadBase64,
  fileDialogToBase64,
} from "../../utils/data";

const NewWorkerDialog = ({
  trigger,
  setOpen,
  open,
}: {
  trigger?: React.ReactNode;
  setOpen?: (open: boolean) => void;
  open?: boolean;
}) => {
  const [name, setName] = useState<string>("");
  const [copyLib, setCopyLib] = useState<boolean>(false);
  const [copyNS, setCopyNS] = useState<boolean>(false);
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  const workersstate = fnrf_zst.workers();

  const [reference, setReference] = useState<{ name: string; uuid: string }>({
    name: "None",
    uuid: "",
  });

  if (!fnrf_zst.options.useWorkerManager) return null;

  return (
    <CustomDialog
      setOpen={setOpen}
      open={open}
      trigger={trigger}
      title="New Worker"
      description="Please provide a name and select a another worker as interpreter reference"
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
      </div>
      <div>
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
        )}
        {name && (
          <div>
            <button
              className="styledbtn"
              onClick={() => {
                fnrf_zst.workermanager?.new_worker({
                  name,
                  reference: reference.uuid,
                  copyLib,
                  copyNS,
                });
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

const Statusbar = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const progress = fnrf_zst.progress_state();

  return (
    <div className="statusbar">
      <span
        className="statusbar-progressbar"
        style={{ width: Math.min(100, 100 * progress.progress) + "%" }}
      ></span>
      <span className="statusbar-message">{progress.message}</span>
    </div>
  );
};

const WorkerMenu = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);
  const workersstate = fnrf_zst.workers();

  const [isNewWorkerDialogOpen, setNewWorkerDialogOpen] = useState(false);

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

  const exportWorker = async () => {
    if (!fnrf_zst.worker) return;
    const data = await fnrf_zst.worker.export();
    downloadBase64(data, "worker.fnw", "application/zip");
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
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="styledbtn">
            <Stack direction="row" spacing={1}>
              <Typography>Worker</Typography> <MenuRoundedIcon />
            </Stack>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="headermenucontent">
            <DropdownMenu.Group>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="headermenuitem submenuitem">
                  <Stack direction="row" spacing={1}>
                    Select
                    <ChevronRightIcon />
                  </Stack>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="headermenucontent"
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
                          if (workersstate[a].active && !workersstate[b].active)
                            return -1;
                          if (!workersstate[a].active && workersstate[b].active)
                            return 1;

                          // If both are active or both are inactive, sort by name or ID

                          const nameA = workersstate[a].name || a;
                          const nameB = workersstate[b].name || b;
                          return nameA.localeCompare(nameB);
                        })
                        .map((workerid) => (
                          <DropdownMenu.RadioItem
                            className={
                              "headermenuitem workerselectoption" +
                              (workersstate[workerid].active
                                ? " active"
                                : " inactive") +
                              " headermenuitem"
                            }
                            key={workerid}
                            value={workerid}
                            disabled={workerid === fnrf_zst.worker?.uuid}
                          >
                            {workersstate[workerid].name || workerid}
                          </DropdownMenu.RadioItem>
                        ))}
                    </DropdownMenu.RadioGroup>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              {fnrf_zst.worker && (
                <>
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
                    onClick={exportWorker}
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
              {fnrf_zst.options.useWorkerManager && (
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
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <NewWorkerDialog
        open={isNewWorkerDialogOpen}
        setOpen={setNewWorkerDialogOpen}
      ></NewWorkerDialog>
    </>
  );
};

const FuncnodesHeader = ({ ...headerprops }: FuncnodesReactHeaderProps) => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

  // pserudouse headerprops
  if (Object.keys(headerprops).length > 0) {
    fnrf_zst.logger.debug("headerprops", headerprops);
  }

  const workersstate = fnrf_zst.workers();
  const onNew = () => {
    const alert = window.confirm("Are you sure you want to start a new flow?");
    if (alert) {
      fnrf_zst.worker?.clear();
    }
  };

  const onSave = async () => {
    const data = await fnrf_zst.worker?.save();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const onOpen = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const contents = e.target?.result;
        if (!contents) return;
        const data = JSON.parse(contents as string);
        await fnrf_zst.worker?.load(data);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const workerselectchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workerid = e.target.value;
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

  return (
    <div className="funcnodesreactflowheader">
      <div className="headerelement">
        <Statusbar></Statusbar>
      </div>
      <div className="headerelement">
        <WorkerMenu></WorkerMenu>
      </div>

      {fnrf_zst.options.useWorkerManager && (
        <div className="headerelement">
          <select
            className="workerselect styleddropdown"
            value={fnrf_zst.worker ? fnrf_zst.worker.uuid : "__select__"}
            onChange={workerselectchange}
          >
            <option disabled value="__select__">
              Select Worker
            </option>
            {Object.keys(workersstate)
              .sort((a, b) => {
                // First, sort by active status (active workers come first)
                if (workersstate[a].active && !workersstate[b].active)
                  return -1;
                if (!workersstate[a].active && workersstate[b].active) return 1;

                // If both are active or both are inactive, sort by name or ID

                const nameA = workersstate[a].name || a;
                const nameB = workersstate[b].name || b;
                return nameA.localeCompare(nameB);
              })
              .map((workerid) => (
                <option
                  className={
                    "workerselectoption" +
                    (workersstate[workerid].active ? " active" : " inactive")
                  }
                  key={workerid}
                  value={workerid}
                >
                  {workersstate[workerid].name || workerid}
                </option>
              ))}
          </select>
        </div>
      )}

      <div className="headerelement">
        <button className="styledbtn" onClick={onNew}>
          new nodespace
        </button>
      </div>
      <div className="headerelement">
        <button className="styledbtn" onClick={onOpen}>
          open
        </button>
      </div>
      <div className="headerelement">
        <button className="styledbtn" onClick={onSave}>
          save
        </button>
      </div>
    </div>
  );
};

export default FuncnodesHeader;
