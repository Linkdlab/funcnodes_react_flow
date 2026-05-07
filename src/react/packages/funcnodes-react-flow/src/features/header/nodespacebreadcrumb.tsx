import * as React from "react";

import { useFuncNodesContext } from "@/providers";
import { useShallow } from "zustand/react/shallow";

/**
 * Displays the active executable group nodespace path as clickable breadcrumbs.
 */
export const NodeSpaceBreadcrumb = () => {
  const fnrf_zst = useFuncNodesContext();
  const { path, loading } = fnrf_zst.active_nodespace(
    useShallow((state) => ({
      path: state.path,
      loading: state.loading,
    }))
  );

  /**
   * Navigate to a root or ancestor path and refresh the active snapshot.
   */
  const navigateToPathIndex = React.useCallback(
    async (index: number) => {
      fnrf_zst.go_to_nodespace_path_index(index);
      try {
        await fnrf_zst.sync_active_nodespace();
      } catch (error) {
        const description = error instanceof Error ? error.message : String(error);
        fnrf_zst.getStateManager().toaster?.error({
          title: "Could not change nodespace",
          description,
        });
      }
    },
    [fnrf_zst]
  );

  /**
   * Return to the parent nodespace and refresh the active snapshot.
   */
  const navigateUp = React.useCallback(async () => {
    fnrf_zst.leave_group_nodespace();
    try {
      await fnrf_zst.sync_active_nodespace();
    } catch (error) {
      const description = error instanceof Error ? error.message : String(error);
      fnrf_zst.getStateManager().toaster?.error({
        title: "Could not change nodespace",
        description,
      });
    }
  }, [fnrf_zst]);

  return (
    <nav
      aria-label="Nodespace path"
      className="nodespacebreadcrumb"
      data-loading={loading}
    >
      {path.length > 0 && (
        <button
          aria-label="Up"
          className="nodespacebreadcrumb-up styledbtn"
          disabled={loading}
          onClick={navigateUp}
          type="button"
        >
          Up
        </button>
      )}
      <button
        className="nodespacebreadcrumb-item"
        disabled={loading && path.length === 0}
        onClick={() => navigateToPathIndex(-1)}
        type="button"
      >
        Root
      </button>
      {path.map((entry, index) => (
        <React.Fragment key={`${entry.groupNodeId}-${index}`}>
          <span aria-hidden="true" className="nodespacebreadcrumb-separator">
            /
          </span>
          <button
            className="nodespacebreadcrumb-item"
            disabled={loading && index === path.length - 1}
            onClick={() => navigateToPathIndex(index)}
            title={entry.groupNodeId}
            type="button"
          >
            {entry.label || entry.groupNodeId}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
