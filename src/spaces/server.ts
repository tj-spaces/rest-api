/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { mutate, Permissions, Updater, verify } from "queryshift";
import { Server as SocketIOServer, Socket } from "socket.io";
import { doesSpaceExist, getSpaceByID, Space } from "../database/tables/spaces";
import { getLogger } from "../lib/ClusterLogger";
import createUuid from "../lib/createUUID";
import { getSessionDataByID } from "../session";
import { Connection } from "../socket";
import { SpaceMessage } from "./SpaceMessage";
import { SpaceParticipant } from "./SpaceParticipant";
import { SpacePositionInfo } from "./SpacePositionInfo";

const allowedParticipantUpdates: Permissions<SpaceParticipant> = {
  $set: {
    displayColor: true,
    displayName: true,
    displayStatus: true,
    movingDirection: true,
    rotatingDirection: true,
  },
};

const SPACE_CACHE_TTL = 60;

const colors = ["red", "blue", "green", "orange", "yellow", "gray"];

const chooseColor = () => colors[Math.floor(Math.random() * colors.length)];

const createDefaultParticipant = (): SpaceParticipant => {
  return {
    accountID: "DEFAULT",
    position: {
      location: { x: 0, y: 0, z: 0 },
      rotation: 0,
    },
    isAdministrator: false,
    isModerator: false,
    canActivateCamera: true,
    canActivateMicrophone: true,
    canPresent: true,
    isPresenting: false,
    displayColor: "red",
    displayName: "user",
    displayStatus: "none",
    movingDirection: 0,
    rotatingDirection: 0,
  };
};

const TICK_MS = 200;
const WALK_STEP = 0.25;
const ROTATE_STEP = Math.PI / 8;

const logger = getLogger("space");

export class SpaceServer {
  /**
   * Key is equal to `participant.participantID`
   */
  participants: Record<string, SpaceParticipant> = {};
  connections: Record<string, Connection> = {};
  space: Space;
  lastCacheLoadTime: -1;
  tickHandle: NodeJS.Timeout | null = null;
  messagesMap: Record<string, SpaceMessage> = {};
  // This is used so we can easily send a list of messages to the client, in order
  messagesInsertionOrder: string[] = [];

  constructor(public io: SocketIOServer, public spaceID: string) {}

  async getSpace(): Promise<Space> {
    if (Date.now() - this.lastCacheLoadTime < SPACE_CACHE_TTL) {
      return this.space;
    } else {
      return await getSpaceByID(this.spaceID);
    }
  }

  getJoinPosition(): SpacePositionInfo {
    return {
      location: { x: 0, y: 0, z: 0 },
      rotation: 0,
    };
  }

  getRoomName() {
    return "space_" + this.spaceID;
  }

  addMessage(senderID: string, content: string) {
    this.io.in(this.getRoomName()).emit("chat_message", senderID, content);
  }

  deregisterParticipantFromSpace(participantID: string) {
    if (!(participantID in this.connections)) {
      logger({ event: "participantLeft", warn: "participant already left" });
      return;
    }

    const { socket } = this.connections[participantID];

    delete this.participants[participantID];
    this.connections[participantID].destroyListeners();
    delete this.connections[participantID];

    socket.broadcast.emit("peer_left", participantID);

    logger({ event: "participantLeft", participantID });

    socket.leave(this.getRoomName());

    if (Object.keys(this.participants).length === 0) {
      if (this.tickHandle != null) {
        clearTimeout(this.tickHandle);
        this.tickHandle = null;
      }
    }
  }

  addParticipantToSpace(participant: SpaceParticipant, socket: Socket) {
    let participantID = participant.accountID;
    let conn = (this.connections[participantID] = new Connection(socket, () => {
      this.deregisterParticipantFromSpace(participantID);
    }));
    this.participants[participantID] = participant;

    logger({ event: "participantJoined", participantID });

    socket.join(this.getRoomName());
    socket.emit("space_join_complete");
    // socket.emit(
    //   "twilio_grant",
    //   createTwilioGrantJwt(participantID, this.spaceID)
    // );
    socket.emit("peers", this.participants);
    socket.broadcast.emit("peer_joined", participant);

    conn.useListener("update", (updates) => {
      if (verify(allowedParticipantUpdates, updates).allowed) {
        this.updateParticipant(participantID, updates);
      }
    });

    conn.useListener("leave_space", () => {
      this.deregisterParticipantFromSpace(participantID);
    });

    conn.useListener("message", (text: string, replyTo?: string) => {
      const id = createUuid();

      this.messagesMap[id] = {
        id,
        senderID: participantID,
        text,
        replyTo,
      };

      this.messagesInsertionOrder.push(id);

      this.io
        .in(this.getRoomName())
        .emit("message", id, participantID, text, replyTo);
    });

    socket.emit("messages", Object.values(this.messagesMap));

    if (this.tickHandle == null) {
      logger({ event: "startedTick" });
      this.tickHandle = setTimeout(() => this.tick(), 0);
    }
  }

  tick() {
    let participants = Object.values(this.participants);
    participants.forEach((participant) => {
      let walkAmount = participant.movingDirection;
      const rotation = participant.position.rotation;

      const dx = Math.sin(rotation) * walkAmount * WALK_STEP;
      const dz = Math.cos(rotation) * walkAmount * WALK_STEP;

      let rotationAmount = participant.rotatingDirection * ROTATE_STEP;
      let newRotation = rotation + rotationAmount;

      if (newRotation < 0) newRotation += Math.PI * 2;
      if (newRotation > Math.PI * 2) newRotation -= Math.PI * 2;

      this.updateParticipant(participant.accountID, {
        $inc: { position: { location: { x: dx, z: dz } } },
        $set: { position: { rotation: newRotation } },
      });
    });

    this.tickHandle = setTimeout(() => this.tick(), TICK_MS);
  }

  updateParticipant(participantID: string, updates: Updater<SpaceParticipant>) {
    this.participants[participantID] = mutate(
      this.participants[participantID],
      updates
    );
    this.io.in(this.getRoomName()).emit("peer_update", participantID, updates);
  }

  async tryJoin(socket: Socket, displayName: string = "user") {
    const session = await getSessionDataByID(
      socket.handshake.query.sessionID as string
    );

    if (session.accountID) {
      const { accountID } = session;

      const participant: SpaceParticipant = {
        ...createDefaultParticipant(),
        accountID,
        displayName,
        displayColor: chooseColor(),
      };

      this.addParticipantToSpace(participant, socket);
    } else {
      logger({ event: "unauthenticatedConnection" });
      socket.emit("unauthenticated");
    }
  }
}

/**
 * For internal use only. The key is the space id.
 */
const spaceServers = new Map<string, SpaceServer>();

export function createSpaceServer(spaceID: string, io: SocketIOServer) {
  logger({ event: "createServer", spaceID });
  const spaceServer = new SpaceServer(io, spaceID);
  spaceServers.set(spaceID, spaceServer);
  return spaceServer;
}

export function getConnectionCount(spaceID: string) {
  if (!spaceServers.has(spaceID)) {
    return 0;
  } else {
    return Object.keys(spaceServers.get(spaceID).participants).length;
  }
}

/**
 * Returns a server used to host a space.
 * If no server exists, it is created.
 * If the space doesn't exist, this returns null.
 * @param spaceID The id of the space
 */
export async function getSpaceServer(
  spaceID: string,
  io: SocketIOServer
): Promise<SpaceServer | null> {
  const spaceExists = await doesSpaceExist(spaceID);
  if (spaceExists) {
    if (spaceServers.has(spaceID)) {
      return spaceServers.get(spaceID);
    } else {
      return createSpaceServer(spaceID, io);
    }
  } else {
    logger({ event: "spaceNotFound" }, "error");
    return null;
  }
}
