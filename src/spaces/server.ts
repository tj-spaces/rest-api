import { Connection } from "../socket";
import { Server as SocketIOServer, Socket } from "socket.io";
import { doesSpaceExist, getSpaceById, Space } from "../database/tables/spaces";
import { SpaceParticipant } from "./SpaceParticipant";
import { SpacePositionInfo } from "./SpacePositionInfo";
import { getSessionDataById } from "../session";
import mapToObject from "../lib/mapToObject";
import createTwilioGrantJwt from "../lib/createTwilioGrant";

const SPACE_CACHE_EXPIRE_TIME = 60;

const colors = ["red", "blue", "green", "orange", "yellow", "gray"];

const chooseColor = () => colors[Math.floor(Math.random() * colors.length)];

const createDefaultParticipant = (): SpaceParticipant => {
  return {
    accountId: "DEFAULT",
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
    moveDirection: 0,
    rotateDirection: 0,
  };
};

const TICK_MS = 200;
const WALK_STEP = 0.25;
const ROTATE_STEP = Math.PI / 8;

export class SpaceServer {
  /**
   * Key is equal to `participant.participantId`
   */
  participants = new Map<string, SpaceParticipant>();
  connections = new Map<string, Connection>();
  cachedSpace: Space;
  lastCacheLoadTime: -1;
  recentMessages: {
    senderId: string;
    content: string;
  }[] = [];
  tickHandle: NodeJS.Timeout = undefined;

  constructor(public io: SocketIOServer, public spaceId: string) {}

  async getSpace(): Promise<Space> {
    if (Date.now() - this.lastCacheLoadTime < SPACE_CACHE_EXPIRE_TIME) {
      return this.cachedSpace;
    } else {
      return await getSpaceById(this.spaceId);
    }
  }

  getJoinPosition(): SpacePositionInfo {
    return {
      location: { x: 0, y: 0, z: 0 },
      rotation: 0,
    };
  }

  getRoomName() {
    return "space_" + this.spaceId;
  }

  addMessage(senderId: string, content: string) {
    this.recentMessages.push({ senderId, content });
    this.io.in(this.getRoomName()).emit("chat_message", senderId, content);
  }

  deregisterParticipantFromSpace(participantId: string) {
    const { socket } = this.connections.get(participantId);

    this.participants.delete(participantId);
    this.connections.delete(participantId);

    socket.removeAllListeners("chat_message");
    socket.removeAllListeners("leave_space");

    socket.broadcast.emit("peer_left", participantId);

    socket.leave(this.getRoomName());

    if (this.participants.size == 0) {
      if (this.tickHandle != null) {
        console.log("Stopped tick");
        clearTimeout(this.tickHandle);
        this.tickHandle = undefined;
      }
    }
  }

  publishParticipantUpdate(participantId: string) {
    this.io
      .in(this.getRoomName())
      .emit("peer_update", participantId, this.participants.get(participantId));
  }

  addParticipantToSpace(participantId: string, participant: SpaceParticipant) {
    const { socket } = this.connections.get(participantId);

    this.participants.set(participantId, participant);

    socket.join(this.getRoomName());
    socket.emit("space_join_complete");
    socket.emit(
      "twilio_grant",
      createTwilioGrantJwt(participantId, this.spaceId)
    );
    socket.emit("peer_info", participant);
    socket.emit("peers", mapToObject(this.participants));
    socket.broadcast.emit("peer_joined", participant);

    socket.on("chat_message", (messageContent) => {
      this.addMessage(participantId, messageContent);
    });

    socket.on("set_walk_direction", (direction) => {
      this.participants.get(participantId).moveDirection = direction;
    });

    socket.on("set_rotate_direction", (direction) => {
      this.participants.get(participantId).rotateDirection = direction;
    });

    socket.on("leave_space", () => {
      this.deregisterParticipantFromSpace(participantId);
    });

    if (this.tickHandle == null) {
      console.log("Started tick");
      this.tickHandle = setTimeout(() => this.tick(), 0);
    }
  }

  tick() {
    let participants = Array.from(this.participants.values());
    participants.forEach((participant) => {
      let walkAmount = participant.moveDirection;
      const rotation = participant.position.rotation;
      const dx = Math.sin(rotation) * walkAmount * WALK_STEP;
      const dz = Math.cos(rotation) * walkAmount * WALK_STEP;
      participant.position.location.x += dx;
      participant.position.location.z += dz;

      let rotationAmount = participant.rotateDirection * ROTATE_STEP;
      let newRotation = rotation + rotationAmount;
      if (newRotation < 0) newRotation += Math.PI * 2;
      if (newRotation > Math.PI * 2) newRotation -= Math.PI * 2;

      participant.position.rotation = newRotation;

      if (walkAmount || rotationAmount) {
        this.publishParticipantUpdate(participant.accountId);
      }
    });
    this.tickHandle = setTimeout(() => this.tick(), TICK_MS);
  }

  tryJoin(socket: Socket, displayName: string = "user") {
    const session = getSessionDataById(socket.handshake.query["sessionId"]);

    if (session?.isLoggedIn) {
      const { accountId } = session;

      const participant: SpaceParticipant = {
        ...createDefaultParticipant(),
        accountId,
        displayName,
        displayColor: chooseColor(),
      };

      this.connections.set(accountId, new Connection(socket));
      this.addParticipantToSpace(accountId, participant);
    } else {
      socket.emit("unauthenticated");
    }
  }
}

/**
 * For internal use only. The key is the space id.
 */
const spaceServers = new Map<string, SpaceServer>();

export function createSpaceServer(spaceId: string, io: SocketIOServer) {
  const spaceServer = new SpaceServer(io, spaceId);
  spaceServers.set(spaceId, spaceServer);
  return spaceServer;
}

export function getConnectionCount(spaceId: string) {
  if (!spaceServers.has(spaceId)) {
    return 0;
  } else {
    return spaceServers.get(spaceId).connections.size;
  }
}

/**
 * Returns a server used to host a space.
 * If no server exists, it is created.
 * If the space doesn't exist, this returns null.
 * @param spaceId The id of the space
 */
export async function getSpaceServer(
  spaceId: string,
  io: SocketIOServer
): Promise<SpaceServer | null> {
  const spaceExists = await doesSpaceExist(spaceId);
  if (spaceExists) {
    if (spaceServers.has(spaceId)) {
      return spaceServers.get(spaceId);
    } else {
      return createSpaceServer(spaceId, io);
    }
  } else {
    return null;
  }
}
