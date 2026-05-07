import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import { getGroupPayload, isExecutableGroupNode } from "@/nodes-core";
import type { IOStore, IOType, NodeStore, NodeType } from "@/nodes-core";
import { useWorkerApi } from "@/workers";
import type { GroupBoundaryOptions } from "@/workers";

interface GroupBoundarySettingsProps {
  nodestore: NodeStore;
}

interface BoundaryCreateFormProps {
  direction: "input" | "output";
  groupNodeId: string;
  onSubmit: (options: GroupBoundaryOptions) => Promise<void>;
}

interface BoundaryIONameControlProps {
  groupNodeId: string;
  ioStore: IOStore;
  onUpdate?: (
    groupNodeId: string,
    boundaryId: string,
    options: GroupBoundaryOptions
  ) => Promise<void> | undefined;
  onRemove?: (
    groupNodeId: string,
    boundaryId: string
  ) => Promise<void> | undefined;
  onError: (title: string, error: unknown) => void;
}

/** Convert an unknown failure value into toaster-friendly text. */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

/** Returns user-facing labels for one public boundary creation form. */
const getBoundaryFormLabels = (direction: "input" | "output") => {
  const title = direction === "input" ? "Input" : "Output";
  return {
    id: `${title} ID`,
    name: `${title} name`,
    type: `${title} type`,
    button: `Add public ${direction}`,
  };
};

/** Returns public boundary IO ids while excluding built-in non-boundary IO. */
const getPublicBoundaryIOIds = (node: NodeType): string[] => {
  const payload = getGroupPayload(node);
  if (!payload) return node.io_order;

  const ids = new Set([
    ...Object.keys(payload.input_bindings),
    ...Object.keys(payload.output_bindings),
  ]);
  const orderedIds = node.io_order.filter((ioId) => ids.has(ioId));
  ids.forEach((ioId) => {
    if (!orderedIds.includes(ioId)) orderedIds.push(ioId);
  });
  return orderedIds;
};

/** Collects metadata for one new public input or output boundary. */
const BoundaryCreateForm = ({
  direction,
  groupNodeId,
  onSubmit,
}: BoundaryCreateFormProps) => {
  const [id, setId] = React.useState("");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("any");
  const labels = getBoundaryFormLabels(direction);

  /** Submit a new boundary IO through the worker-owned graph mutation API. */
  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedId = id.trim();
      if (!trimmedId) return;
      const trimmedName = name.trim();
      const trimmedType = type.trim();
      try {
        await onSubmit({
          id: trimmedId,
          ...(trimmedName ? { name: trimmedName } : {}),
          ...(trimmedType ? { type: trimmedType } : {}),
        });
        setId("");
        setName("");
        setType("any");
      } catch {
        // The caller owns error reporting so the form can keep the failed edit.
      }
    },
    [id, name, onSubmit, type]
  );

  return (
    <form
      className="nodesettings-io-entry funcnodes-control-group"
      onSubmit={handleSubmit}
    >
      <div className="funcnodes-control-row">
        <label htmlFor={`${groupNodeId}-${direction}-boundary-id`}>
          {labels.id}
        </label>
        <input
          id={`${groupNodeId}-${direction}-boundary-id`}
          type="text"
          className="styledinput"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
      </div>
      <div className="funcnodes-control-row">
        <label htmlFor={`${groupNodeId}-${direction}-boundary-name`}>
          {labels.name}
        </label>
        <input
          id={`${groupNodeId}-${direction}-boundary-name`}
          type="text"
          className="styledinput"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="funcnodes-control-row">
        <label htmlFor={`${groupNodeId}-${direction}-boundary-type`}>
          {labels.type}
        </label>
        <input
          id={`${groupNodeId}-${direction}-boundary-type`}
          type="text"
          className="styledinput"
          value={type}
          onChange={(event) => setType(event.target.value)}
        />
      </div>
      <button type="submit">{labels.button}</button>
    </form>
  );
};

/** Renders rename and removal controls for one existing public boundary IO. */
const BoundaryIONameControl = ({
  groupNodeId,
  ioStore,
  onUpdate,
  onRemove,
  onError,
}: BoundaryIONameControlProps) => {
  const io: IOType = ioStore.use();
  const [draftName, setDraftName] = React.useState(io.name);

  React.useEffect(() => {
    setDraftName(io.name);
  }, [io.name]);

  /** Persist a changed public boundary name through the worker command layer. */
  const saveName = React.useCallback(async () => {
    if (draftName === io.name || !onUpdate) return;
    try {
      await onUpdate(groupNodeId, io.id, { name: draftName });
    } catch (error) {
      onError("Could not update boundary IO", error);
    }
  }, [draftName, groupNodeId, io.id, io.name, onError, onUpdate]);

  /** Remove this public boundary through the worker command layer. */
  const removeBoundary = React.useCallback(async () => {
    if (!onRemove) return;
    try {
      await onRemove(groupNodeId, io.id);
    } catch (error) {
      onError("Could not remove boundary IO", error);
    }
  }, [groupNodeId, io.id, onError, onRemove]);

  return (
    <div className="nodesettings-io-entry funcnodes-control-group">
      <div className="funcnodes-control-row">
        <label htmlFor={`group-boundary-name-${io.id}`}>{io.id}</label>
        <input
          id={`group-boundary-name-${io.id}`}
          aria-label={`Boundary name ${io.id}`}
          type="text"
          className="styledinput"
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={saveName}
        />
      </div>
      <button
        type="button"
        aria-label={`Remove boundary ${io.id}`}
        onClick={removeBoundary}
      >
        Remove boundary {io.id}
      </button>
    </div>
  );
};

/**
 * Shows executable group public-interface controls in the selected node settings.
 */
export const GroupBoundarySettings = ({
  nodestore,
}: GroupBoundarySettingsProps) => {
  const node = nodestore.use();
  const fnrf_zst = useFuncNodesContext();
  const { group } = useWorkerApi();

  /** Surface worker command failures without applying optimistic local edits. */
  const showError = React.useCallback(
    (title: string, error: unknown) => {
      fnrf_zst.getStateManager().toaster?.error({
        title,
        description: getErrorMessage(error),
      });
    },
    [fnrf_zst]
  );

  /** Add one public input and let the worker resync refresh the node snapshot. */
  const addInput = React.useCallback(
    async (options: GroupBoundaryOptions) => {
      try {
        await group?.add_group_input(node.id, options);
      } catch (error) {
        showError("Could not add public input", error);
        throw error;
      }
    },
    [group, node.id, showError]
  );

  /** Add one public output and let the worker resync refresh the node snapshot. */
  const addOutput = React.useCallback(
    async (options: GroupBoundaryOptions) => {
      try {
        await group?.add_group_output(node.id, options);
      } catch (error) {
        showError("Could not add public output", error);
        throw error;
      }
    },
    [group, node.id, showError]
  );

  if (!isExecutableGroupNode(node)) return null;

  return (
    <div className="nodesettings_section">
      <div>Public interface</div>
      <BoundaryCreateForm
        direction="input"
        groupNodeId={node.id}
        onSubmit={addInput}
      />
      <BoundaryCreateForm
        direction="output"
        groupNodeId={node.id}
        onSubmit={addOutput}
      />
      {getPublicBoundaryIOIds(node).map((ioId) => {
        const ioStore = nodestore.io_stores.get(ioId);
        if (!ioStore) return null;
        return (
          <BoundaryIONameControl
            key={ioId}
            groupNodeId={node.id}
            ioStore={ioStore}
            onUpdate={group?.update_group_io}
            onRemove={group?.remove_group_io}
            onError={showError}
          />
        );
      })}
    </div>
  );
};
