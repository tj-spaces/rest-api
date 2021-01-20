import { Connection } from "../socket";
import { Server as SocketIOServer } from "socket.io";
import { doesSpaceExist, getSpaceById, Space } from "../database/tables/spaces";
import { SpaceParticipant } from "./SpaceParticipant";
import { SpacePositionInfo } from "./SpacePositionInfo";
import { DisplayStatus } from "./DisplayStatus";
import { getSessionDataById } from "../session";
import createUuid from "../lib/createUuid";

const SPACE_CACHE_EXPIRE_TIME = 60;
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

  getDefaultCanPresent() {
    return false;
  }

  getDefaultDisplayName() {
    return "User";
  }

  getDefaultDisplayStatus(): DisplayStatus {
    return "none";
  }

  getDefaultDisplayColor() {
    return "red";
  }

  getDefaultCanActivateCamera() {
    return true;
  }

  getDefaultCanActivateMicrophone() {
    return true;
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
    socket.removeAllListeners("chat_message");
    socket.broadcast.emit("peer_left", participantId);

    socket.leave(this.getRoomName());
  }

  addParticipantToSpace(participantId: string, participant: SpaceParticipant) {
    const { socket } = this.connections.get(participantId);

    this.participants.set(participantId, participant);

    socket.join(this.getRoomName());
    socket.emit("space_join_complete");
    socket.emit("peer_info", participant);
    socket.emit("peers", this.participants);
    socket.broadcast.emit("peer_joined", participant);

    socket.on("chat_message", (messageContent) => {
      this.addMessage(participantId, messageContent);
    });
  }

  tryJoin(socket: SocketIO.Socket, displayName?: string) {
    const session = getSessionDataById(socket.handshake.query["sessionId"]);

    if (session?.isLoggedIn) {
      const sessionId = createUuid();
      const participantId = session.accountId;

      const participant: SpaceParticipant = {
        sessionId,
        participantId,
        displayColor: this.getDefaultDisplayColor(),
        displayName: displayName || this.getDefaultDisplayName(),
        displayStatus: this.getDefaultDisplayStatus(),
        canPresent: this.getDefaultCanPresent(),
        canActivateCamera: this.getDefaultCanActivateCamera(),
        canActivateMicrophone: this.getDefaultCanActivateMicrophone(),
        isAdministrator: false,
        isModerator: false,
        isPresenting: false,
        position: this.getJoinPosition(),
      };

      this.connections.set(participantId, new Connection(socket));
      this.addParticipantToSpace(participantId, participant);
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
