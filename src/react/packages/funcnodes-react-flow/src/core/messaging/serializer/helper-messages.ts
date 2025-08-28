export interface LargeMessageHint {
  type: "large_message";
  msg_id: string;
}

export interface PongMessage {
  type: "pong";
}
