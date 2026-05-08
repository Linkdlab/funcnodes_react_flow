import * as React from "react";
import { useFuncNodesContext } from "@/providers";
import {
  getGroupPayload,
  isExecutableGroupNode,
  isGroupInputGateway,
  isGroupOutputGateway,
} from "@/nodes-core";
import type { IOStore, IOType, NodeStore, NodeType } from "@/nodes-core";
import { useWorkerApi } from "@/workers";
import type { GroupBoundaryOptions } from "@/workers";
import type { NodeSpacePath } from "@/funcnodes-context";

interface GroupBoundarySettingsProps {
  nodestore: NodeStore;
}

interface BoundaryCreateFormProps {
  direction: BoundaryDirection;
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

type BoundaryDirection = "input" | "output";

interface BoundarySettingsContext {
  groupNodeId: string;
  path?: NodeSpacePath;
  directions: BoundaryDirection[];
  ioIds: string[];
  title: string;
}

/** Convert an unknown failure value into toaster-friendly text. */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

/** Returns user-facing labels for one public boundary creation form. */
const getBoundaryFormLabels = (direction: BoundaryDirection) => {
  const title = direction === "input" ? "Input" : "Output";
  return {
    name: `${title} name`,
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

/** Returns gateway IO ids in the same order they are rendered on the node. */
const getGatewayBoundaryIOIds = (
  node: NodeType,
  direction: BoundaryDirection
): string[] => {
  const validIds = new Set(direction === "input" ? node.outputs : node.inputs);
  return node.io_order.filter((ioId) => validIds.has(ioId));
};

/**
 * Resolves which executable group boundary a selected node settings panel edits.
 *
 * Selecting the outer `GroupNode` edits that node at the active path. Selecting
 * an internal gateway edits the current group from its parent path, because the
 * gateway is displayed one level below the group node that owns public IO.
 */
const getBoundarySettingsContext = (
  node: NodeType,
  activePath: NodeSpacePath
): BoundarySettingsContext | undefined => {
  if (isExecutableGroupNode(node)) {
    return {
      groupNodeId: node.id,
      directions: ["input", "output"],
      ioIds: getPublicBoundaryIOIds(node),
      title: "Public interface",
    };
  }

  const currentGroup = activePath[activePath.length - 1];
  if (!currentGroup) return undefined;

  if (isGroupInputGateway(node)) {
    return {
      groupNodeId: currentGroup.groupNodeId,
      path: activePath.slice(0, -1),
      directions: ["input"],
      ioIds: getGatewayBoundaryIOIds(node, "input"),
      title: "Current group inputs",
    };
  }

  if (isGroupOutputGateway(node)) {
    return {
      groupNodeId: currentGroup.groupNodeId,
      path: activePath.slice(0, -1),
      directions: ["output"],
      ioIds: getGatewayBoundaryIOIds(node, "output"),
      title: "Current group outputs",
    };
  }

  return undefined;
};

/** Collects metadata for one new public input or output boundary. */
const BoundaryCreateForm = ({
  direction,
  groupNodeId,
  onSubmit,
}: BoundaryCreateFormProps) => {
  const [name, setName] = React.useState("");
  const labels = getBoundaryFormLabels(direction);

  /** Submit a name-only boundary and let the backend generate ID and Any type. */
  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim();
      try {
        await onSubmit({
          ...(trimmedName ? { name: trimmedName } : {}),
        });
        setName("");
      } catch {
        // The caller owns error reporting so the form can keep the failed edit.
      }
    },
    [name, onSubmit]
  );

  return (
    <form
      className="nodesettings-io-entry funcnodes-control-group"
      onSubmit={handleSubmit}
    >
      <div className="funcnodes-control-row">
        <div>
        <label htmlFor={`${groupNodeId}-${direction}-boundary-name`}>
          {labels.name}
        </label>
        </div>
        <input
          id={`${groupNodeId}-${direction}-boundary-name`}
          type="text"
          className="styledinput"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <button type="submit" className="styledbtn">{labels.button}</button>
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
        <div>
        <label htmlFor={`group-boundary-name-${io.id}`}>{io.id}</label>
        </div>
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
        className="styledbtn"
        aria-label={`Remove boundary ${io.id}`}
        onClick={removeBoundary}
      >
        Remove boundary
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
  const activePath = fnrf_zst.active_nodespace((state) => state.path);
  const boundaryContext = getBoundarySettingsContext(node, activePath);

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
      if (!boundaryContext) return;
      try {
        if (boundaryContext.path) {
          await group?.add_group_input_at_path(
            boundaryContext.path,
            boundaryContext.groupNodeId,
            options
          );
        } else {
          await group?.add_group_input(boundaryContext.groupNodeId, options);
        }
      } catch (error) {
        showError("Could not add public input", error);
        throw error;
      }
    },
    [boundaryContext, group, showError]
  );

  /** Add one public output and let the worker resync refresh the node snapshot. */
  const addOutput = React.useCallback(
    async (options: GroupBoundaryOptions) => {
      if (!boundaryContext) return;
      try {
        if (boundaryContext.path) {
          await group?.add_group_output_at_path(
            boundaryContext.path,
            boundaryContext.groupNodeId,
            options
          );
        } else {
          await group?.add_group_output(boundaryContext.groupNodeId, options);
        }
      } catch (error) {
        showError("Could not add public output", error);
        throw error;
      }
    },
    [boundaryContext, group, showError]
  );

  /** Update a boundary through the command target resolved for this settings UI. */
  const updateBoundary = React.useCallback(
    async (
      groupNodeId: string,
      boundaryId: string,
      options: GroupBoundaryOptions
    ) => {
      if (boundaryContext?.path) {
        await group?.update_group_io_at_path(
          boundaryContext.path,
          groupNodeId,
          boundaryId,
          options
        );
        return;
      }
      await group?.update_group_io(groupNodeId, boundaryId, options);
    },
    [boundaryContext, group]
  );

  /** Remove a boundary through the command target resolved for this settings UI. */
  const removeBoundary = React.useCallback(
    async (groupNodeId: string, boundaryId: string) => {
      if (boundaryContext?.path) {
        await group?.remove_group_io_at_path(
          boundaryContext.path,
          groupNodeId,
          boundaryId
        );
        return;
      }
      await group?.remove_group_io(groupNodeId, boundaryId);
    },
    [boundaryContext, group]
  );

  if (!boundaryContext) return null;

  return (
    <div className="nodesettings_section">
      <div>{boundaryContext.title}</div>

      {boundaryContext.directions.includes("input") && (
        <div className="nodesettings_component">
        <BoundaryCreateForm
          direction="input"
          groupNodeId={boundaryContext.groupNodeId}
          onSubmit={addInput}
        />
        </div>
      )}
      {boundaryContext.directions.includes("output") && (
        <div className="nodesettings_component">
        <BoundaryCreateForm
          direction="output"
          groupNodeId={boundaryContext.groupNodeId}
          onSubmit={addOutput}
        />
        </div>
      )}
      {boundaryContext.ioIds.map((ioId) => {
        const ioStore = nodestore.io_stores.get(ioId);
        if (!ioStore) return null;
        return (
          <div className="nodesettings_component">
          <BoundaryIONameControl
            key={ioId}
            groupNodeId={boundaryContext.groupNodeId}
            ioStore={ioStore}
            onUpdate={updateBoundary}
            onRemove={removeBoundary}
            onError={showError}
          />
          </div>
        );
      })}
    </div>
  );
};
