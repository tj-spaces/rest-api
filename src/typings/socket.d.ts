/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/

import { Updater } from "queryshift";
import { SpaceMessage } from "../spaces/SpaceMessage";
import { SpaceParticipant } from "../spaces/SpaceParticipant";

type ToClientEventMap = {
  peer_joined: [SpaceParticipant];
  peer_left: [string];
  peer_info: [SpaceParticipant];
  ping: [string, number];
  peers: [Map<string, SpaceParticipant>];
  space_not_found: [];
  space_join_complete: [];
  unauthenticated: [];
  peer_update: [string, SpaceParticipant];
  messages: [SpaceMessage[]];
  "joined-room": [string]; // roomID
};

type ToServerEventMap = {
  "join-room": [string]; // roomID
  "leave-room": [];
  chat_message: [string]; // messageContent
  disconnect: [];
  leave_space: [];
  join_space: [string];
  ping: [string];
  update: [Updater<SpaceParticipant>];
  message: [string, string]; // text, replyTo
};

declare module "socket.io" {
  interface Socket {
    emit<E extends keyof ToClientEventMap>(
      ev: E,
      ...args: ToClientEventMap[E]
    ): this;

    on<E extends keyof ToServerEventMap>(
      ev: E,
      cb: (...args: ToServerEventMap[E]) => void
    ): this;
  }
}
