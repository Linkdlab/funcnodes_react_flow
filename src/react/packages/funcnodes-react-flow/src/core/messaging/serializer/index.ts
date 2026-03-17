import type { ErrorMessage } from "./error-messages";
export type { ErrorMessage };
import type { NodeSpaceEvent, WorkerEvent } from "./event-messages";
export type { NodeSpaceEvent, WorkerEvent };
import type { LargeMessageHint, PongMessage } from "./helper-messages";
export type { LargeMessageHint, PongMessage };
import type { ResultMessage } from "./result-messages";
export type { ResultMessage };
import type { CmdMessage } from "./cmd-messages";
export type { CmdMessage };
import type { ProgressStateMessage } from "./progress-message";
export type { ProgressStateMessage };

export type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent
  | WorkerEvent
  | LargeMessageHint
  | PongMessage;
