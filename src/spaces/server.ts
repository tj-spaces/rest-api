import { Connection } from "../socket";
import { Server as SocketIOServer, Socket } from "socket.io";
import { doesSpaceExist, getSpaceById, Space } from "../database/tables/spaces";
import { SpaceParticipant } from "./SpaceParticipant";
import { SpacePositionInfo } from "./SpacePositionInfo";
import { DisplayStatus } from "./DisplayStatus";
import { getSessionDataById } from "../session";
import createUuid from "../lib/createUuid";
import mapToObject from "../lib/mapToObject";
import createTwilioGrantJwt from "../lib/createTwilioGrant";

const SPACE_CACHE_EXPIRE_TIME = 60;

const createDefaultParticipant = (): SpaceParticipant => {
  return {
    accountId: "DEFAULT",
    position: {
      location: { x: 0, y: 0 },
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
    movingForward: false,
    movingBackward: false,
    rotatingLeft: false,
    rotatingRight: false,
  };
};

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
      location: {
        x: 0,
        y: 0,
      },
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

    socket.on("walk", (amt) => {
      const p = this.participants.get(participantId);
      const rotation = p.position.rotation;
      const dx = Math.cos(rotation) * amt;
      const dy = Math.sin(rotation) * amt;
      p.position.location.x += dx;
      p.position.location.y += dy;

      this.publishParticipantUpdate(participantId);
    });

    socket.on("rotate", (amt) => {
      const p = this.participants.get(participantId);
      const rotation = p.position.rotation;
      const newRotation = ((rotation + amt) % Math.PI) * 2;
      p.position.rotation = newRotation;

      this.publishParticipantUpdate(participantId);
    });

    socket.on("leave_space", () => {
      this.deregisterParticipantFromSpace(participantId);
    });
  }

  // tick() {
  //   let participants = Array.from(this.participants.values());
  //   participants.forEach((participant) => {
  //     let walkAmount =
  //       (participant.movingForward ? 1 : 0) -
  //       (participant.movingBackward ? 1 : 0);
  //     const rotation = participant.position.rotation;
  //     const dx = Math.cos(rotation) * walkAmount;
  //     const dy = Math.sin(rotation) * walkAmount;
  //     participant.position.location.x += dx;
  //     participant.position.location.y += dy;
  //   });
  //   setTimeout(() => this.tick(), 200);
  // }

  tryJoin(socket: Socket) {
    const session = getSessionDataById(socket.handshake.query["sessionId"]);

    if (session?.isLoggedIn) {
      const { accountId } = session;

      const participant: SpaceParticipant = {
        ...createDefaultParticipant(),
        accountId,
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
