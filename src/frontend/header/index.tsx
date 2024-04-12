import { useContext, useState } from "react";
import { FuncNodesReactFlowZustandInterface } from "../../state";
import { FuncNodesContext } from "../funcnodesreactflow";

import "./header.scss";
import CustomDialog from "../dialog";

const NewWorkerDialog = ({ trigger }: { trigger: React.ReactNode }) => {
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

  return (
    <CustomDialog
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

const FuncnodesHeader = () => {
  const fnrf_zst: FuncNodesReactFlowZustandInterface =
    useContext(FuncNodesContext);

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
        <select
          className="workerselect styleddropdown"
          value={fnrf_zst.worker ? fnrf_zst.worker.uuid : "__select__"}
          onChange={workerselectchange}
        >
          <option disabled value="__select__">
            Select Worker
          </option>
          {Object.keys(workersstate).map((workerid) => (
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

      {fnrf_zst.worker && (
        <>
          <div className="headerelement">
            <button
              className="styledbtn"
              onClick={() => {
                if (!fnrf_zst.worker) return;
                fnrf_zst.worker.stop();
              }}
            >
              stop worker
            </button>
          </div>
          <div className="headerelement">
            <button
              className="styledbtn"
              onClick={() => {
                if (!fnrf_zst.worker) return;
                fnrf_zst.workermanager?.restart_worker(fnrf_zst.worker.uuid);
              }}
            >
              restart worker
            </button>
          </div>
        </>
      )}
      <div className="headerelement">
        <NewWorkerDialog
          trigger={<button className="styledbtn">new worker</button>}
        ></NewWorkerDialog>
      </div>
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
