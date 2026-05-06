import * as React from "react";

import { useFuncNodesContext } from "@/providers";
import type { WorkerRepresentation } from "@/workers";

const DEFAULT_UPDATE_ON_STARTUP = [
  "funcnodes",
  "funcnodes-core",
  "funcnodes-worker",
];

export const WorkerSettingsDialogContent = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const fnrf_zst = useFuncNodesContext();
  const workersstate = fnrf_zst.workers();
  const worker = fnrf_zst.worker;
  const workerConfig = worker?.uuid ? workersstate[worker.uuid] : undefined;
  const [name, setName] = React.useState(workerConfig?.name || "");
  const [autostart, setAutostart] = React.useState(
    workerConfig?.autostart || false
  );
  const [updateOnStartup, setUpdateOnStartup] = React.useState<
    Record<string, boolean>
  >(workerConfig?.update_on_startup || {});
  const [loadedConfig, setLoadedConfig] = React.useState<
    WorkerRepresentation | undefined
  >(workerConfig);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoadedConfig(workerConfig);
    setName(workerConfig?.name || "");
    setAutostart(workerConfig?.autostart || false);
    setUpdateOnStartup(workerConfig?.update_on_startup || {});

    if (!worker) return;

    worker
      .get_config()
      .then((config) => {
        if (cancelled) return;
        setLoadedConfig(config);
        setName(config.name || "");
        setAutostart(config.autostart || false);
        setUpdateOnStartup(config.update_on_startup || {});
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [worker, workerConfig?.name, workerConfig?.autostart]);

  if (!worker) return null;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updatedConfig = await worker.update_settings({
        name,
        autostart,
        update_on_startup: updateOnStartup,
      });
      fnrf_zst.workers.setState((state) => ({
        ...state,
        [worker.uuid]: {
          ...state[worker.uuid],
          ...updatedConfig,
          active: true,
          open: worker.is_open,
        },
      }));
      setOpen(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const updateKeys = Array.from(
    new Set([
      ...DEFAULT_UPDATE_ON_STARTUP,
      ...Object.keys(updateOnStartup || {}),
    ])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label>
        Name
        <input
          className="styledinput full-width"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </label>
      <label>
        <input
          className="styledcheckbox"
          type="checkbox"
          checked={autostart}
          onChange={(e) => setAutostart(e.currentTarget.checked)}
        />
        Autostart
      </label>
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Update on startup</div>
        {updateKeys.map((key) => (
          <label key={key} style={{ display: "block" }}>
            <input
              className="styledcheckbox"
              type="checkbox"
              checked={updateOnStartup[key] ?? true}
              onChange={(e) =>
                setUpdateOnStartup((state) => ({
                  ...state,
                  [key]: e.currentTarget.checked,
                }))
              }
            />
            {key}
          </label>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 8,
        }}
      >
        <span>UUID</span>
        <span>{loadedConfig?.uuid || worker.uuid}</span>
        <span>Type</span>
        <span>{loadedConfig?.type || "Worker"}</span>
        <span>Host</span>
        <span>{loadedConfig?.host || ""}</span>
        <span>Port</span>
        <span>{loadedConfig?.port || ""}</span>
      </div>
      {error && <div className="error">{error}</div>}
      <button className="styledbtn" onClick={save} disabled={saving}>
        {saving ? "Saving" : "Save"}
      </button>
    </div>
  );
};
