/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/

import { Updater } from "queryshift";
import { SpaceMessage } from "../spaces/SpaceMessage";
import { SpaceParticipant } from "../spaces/SpaceParticipant";

declare module "socket.io" {
  interface Socket {
    emit(ev: "peer_joined", peer: SpaceParticipant): this;
    emit(ev: "peer_left", peerID: string): this;
    emit(ev: "peer_info", peer: SpaceParticipant): this;
    emit(ev: "ping", key: string, lastPingLatency: number): this;
    emit(ev: "peers", users: Map<string, SpaceParticipant>): this;
    emit(
      ev: "space_not_found" | "space_join_complete" | "unauthenticated"
    ): this;
    emit(ev: "twilio_grant", grant: string): this;
    emit(ev: "peer_update", peerID: string, peer: SpaceParticipant): this;
    emit(
      ev: "messages",
      questionID: string,
      senderID: string,
      text: string
    ): this;
    emit(ev: "messages", messages: SpaceMessage[]): this;
    emit(ev: "joined-room", roomID: string): this;

    on(ev: "join-room", cb: (roomID: string) => void): this;
    on(ev: "chat_message", cb: (messageContent: string) => void): this;
    on(ev: "disconnect", cb: () => void): this;
    on(ev: "leave_space", cb: () => void): this;
    on(ev: "join_space", cb: (spaceID: string) => void): this;
    on(ev: "ping", cb: (key: string) => void): this;
    on(ev: "update", cb: (updates: Updater<SpaceParticipant>) => void): this;
    on(ev: "message", cb: (text: string, replyTo?: string) => void): this;
  }
}
