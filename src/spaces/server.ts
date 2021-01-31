import { Connection } from "../socket";
import { Server as SocketIOServer, Socket } from "socket.io";
import { doesSpaceExist, getSpaceById, Space } from "../database/tables/spaces";
import { SpaceParticipant } from "./SpaceParticipant";
import { SpacePositionInfo } from "./SpacePositionInfo";
import { getSessionDataById } from "../session";
import createTwilioGrantJwt from "../lib/createTwilioGrant";
import { mutate, verify, Updater, Permissions } from "queryshift";

const allowedParticipantUpdates: Permissions<SpaceParticipant> = {
  $set: {
    displayColor: true,
    displayName: true,
    displayStatus: true,
    movingDirection: true,
    rotatingDirection: true,
  },
};

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
    movingDirection: 0,
    rotatingDirection: 0,
  };
};

const TICK_MS = 200;
const WALK_STEP = 0.25;
const ROTATE_STEP = Math.PI / 8;

export class SpaceServer {
  /**
   * Key is equal to `participant.participantId`
   */
  participants: Record<string, SpaceParticipant> = {};
  connections: Record<string, Connection> = {};
  onlineCount: number = 0;
  space: Space;
  lastCacheLoadTime: -1;
  recentMessages: {
    senderId: string;
    content: string;
  }[] = [];
  tickHandle: NodeJS.Timeout | null = null;

  constructor(public io: SocketIOServer, public spaceId: string) {}

  async getSpace(): Promise<Space> {
    if (Date.now() - this.lastCacheLoadTime < SPACE_CACHE_EXPIRE_TIME) {
      return this.space;
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
    const { socket } = this.connections[participantId];

    delete this.participants[participantId];
    delete this.connections[participantId];
    this.onlineCount--;

    socket.removeAllListeners("chat_message");
    socket.removeAllListeners("leave_space");
    socket.removeAllListeners("set_display_name");
    socket.removeAllListeners("set_display_status");
    socket.removeAllListeners("set_display_color");
    socket.removeAllListeners("set_walk_direction");
    socket.removeAllListeners("set_rotate_direction");

    socket.broadcast.emit("peer_left", participantId);

    socket.leave(this.getRoomName());

    if (this.onlineCount == 0) {
      if (this.tickHandle != null) {
        console.log("Stopped tick");
        clearTimeout(this.tickHandle);
        this.tickHandle = null;
      }
    }
  }

  addParticipantToSpace(participant: SpaceParticipant, socket: Socket) {
    let participantId = participant.accountId;
    this.connections[participantId] = new Connection(socket, () => {
      this.deregisterParticipantFromSpace(participantId);
    });
    this.participants[participantId] = participant;

    socket.join(this.getRoomName());
    socket.emit("space_join_complete");
    socket.emit(
      "twilio_grant",
      createTwilioGrantJwt(participantId, this.spaceId)
    );
    socket.emit("peers", this.participants);
    socket.broadcast.emit("peer_joined", participant);

    socket.on("chat_message", (messageContent) => {
      this.addMessage(participantId, messageContent);
    });

    socket.on("update", (updates) => {
      if (verify(allowedParticipantUpdates, updates).allowed) {
        this.updateParticipant(participantId, updates);
      }
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

      this.updateParticipant(participant.accountId, {
        $inc: {
          position: {
            location: { x: dx, z: dz },
            rotation: newRotation,
          },
        },
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

      this.addParticipantToSpace(participant, socket);
    } else {
      socket.emit("unauthenticated");
    }
  }
}

/**
 * For internal use only. The key is the space id.
 */
const spaceServers = new Map<string, SpaceServer>();

export function createSpaceServer(spaceID: string, io: SocketIOServer) {
  const spaceServer = new SpaceServer(io, spaceID);
  spaceServers.set(spaceID, spaceServer);
  return spaceServer;
}

export function getConnectionCount(spaceId: string) {
  if (!spaceServers.has(spaceId)) {
    return 0;
  } else {
    return spaceServers.get(spaceId).onlineCount;
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
    return null;
  }
}
