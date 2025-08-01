import { ErrorMessage } from "./error-messages";
export type { ErrorMessage };
import { NodeSpaceEvent, WorkerEvent } from "./event-messages";
export type { NodeSpaceEvent, WorkerEvent };
import { LargeMessageHint, PongMessage } from "./helper-messages";
export type { LargeMessageHint, PongMessage };
import { ResultMessage } from "./result-messages";
export type { ResultMessage };
import { CmdMessage } from "./cmd-messages";
export type { CmdMessage };
import { ProgressStateMessage } from "./progress-message";
export type { ProgressStateMessage };

export type JSONMessage =
  | ProgressStateMessage
  | ResultMessage
  | ErrorMessage
  | NodeSpaceEvent
  | WorkerEvent
  | LargeMessageHint
  | PongMessage;
