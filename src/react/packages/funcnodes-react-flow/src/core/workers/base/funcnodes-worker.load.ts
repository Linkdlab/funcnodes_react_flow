type SendLoadCommand = (params: {
  cmd: "load_data";
  kwargs: { data: any };
  wait_for_response: true;
}) => Promise<unknown>;

type FullSync = () => Promise<unknown> | unknown;

export interface LoadWorkerDataOptions {
  data: any;
  resetNodeSpacePath?: () => void;
  sendCommand: SendLoadCommand;
  fullSync: FullSync;
}

/**
 * Load serialized worker data from the backend and resync the root nodespace.
 *
 * Loading replaces the backend graph, so any active executable group path from
 * the previous graph is invalid. Resetting the path before sending the command
 * prevents the follow-up full sync from requesting a stale nested nodespace.
 */
export const loadWorkerData = async ({
  data,
  resetNodeSpacePath,
  sendCommand,
  fullSync,
}: LoadWorkerDataOptions): Promise<void> => {
  resetNodeSpacePath?.();
  await sendCommand({
    cmd: "load_data",
    kwargs: { data },
    wait_for_response: true,
  });
  await fullSync();
};
