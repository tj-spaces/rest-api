// import { ParamsDictionary, Request } from "express-serve-static-core";
// import { ParsedQs } from "qs";
// type ResBody = any;
// type ReqBody = any;
// type ReqQuery = ParsedQs;

// import * as SIO from "socket.io";
import { SpaceInhabitant } from "../space";

declare module "socket.io" {
  class Socket {
    emit(ev: "peer_joined", peer: SpaceInhabitant): boolean;
    emit(ev: "peer_left", peer: SpaceInhabitant): boolean;
    emit(ev: "peer_info", peer: SpaceInhabitant): boolean;
    emit(ev: "ping", key: string): boolean;
    emit(
      ev: "chat_message",
      messageContent: string,
      senderUserId: string
    ): boolean;
    emit(ev: "space_inhabitants", users: Map<string, SpaceInhabitant>): boolean;
    emit(ev: "in_waiting_room" | "space_not_found"): boolean;

    on(ev: "chat_message", cb: (messageContent: string) => void): boolean;
    on(ev: "disconnect", cb: () => void): boolean;
    on(ev: "join_space", cb: (spaceId: string) => void): boolean;
  }
}

// declare namespace SocketIO {
//   interface Socket {
//     request: Request<ParamsDictionary, ResBody, ReqBody, ReqQuery>;
//   }
// }
