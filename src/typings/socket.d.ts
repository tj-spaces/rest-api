// import { ParamsDictionary, Request } from "express-serve-static-core";
// import { ParsedQs } from "qs";
// type ResBody = any;
// type ReqBody = any;
// type ReqQuery = ParsedQs;

// import * as SIO from "socket.io";
import { SpaceParticipant } from "../space";

declare module "socket.io" {
  interface Socket {
    emit(ev: "peer_joined", peer: SpaceParticipant): this;
    emit(ev: "peer_left", peer: SpaceParticipant): this;
    emit(ev: "peer_info", peer: SpaceParticipant): this;
    emit(ev: "ping", key: string, lastPingLatency: number): this;
    emit(
      ev: "chat_message",
      messageContent: string,
      senderUserId: string
    ): this;
    emit(ev: "space_inhabitants", users: Map<string, SpaceParticipant>): this;
    emit(
      ev:
        | "space_in_waiting_room"
        | "space_not_found"
        | "space_join_complete"
        | "space_join_denied"
    ): this;

    on(ev: "chat_message", cb: (messageContent: string) => void): this;
    on(ev: "disconnect", cb: () => void): this;
    on(ev: "join_space", cb: (spaceId: string) => void): this;
    on(ev: "ping", cb: (key: string) => void): this;
  }
}

// declare namespace SocketIO {
//   interface Socket {
//     request: Request<ParamsDictionary, ResBody, ReqBody, ReqQuery>;
//   }
// }
