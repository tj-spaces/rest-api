import createUuid from "../lib/createUuid";
import { Connection, CustomSocket } from "../socket";
import { Server as SocketIOServer } from "socket.io";
import isDevelopmentMode from "../lib/isDevelopment";
import { nextId } from "../lib/snowflakeId";
import { doesSpaceExist, getSpaceById, Space } from "../database/tables/spaces";

export type DisplayStatus =
  | "agree"
  | "disagree"
  | "faster"
  | "slower"
  | "raised-hand"
  | "none";

/**
 * Where the user is in the space.
 * This is a 2D location, because as of now, the spaces are "2.5-dimensional" worlds
 */
export interface SpaceLocation {
  x: number;
  y: number;
}

/**
 * An Participant in a space is anybody in the space that is either a guest or a user with an account.
 * This is not the same as an Account, which holds necessary information such as a user's email, username,
 * birthday, and etc.
 */
export interface SpaceParticipant {
  /**
   * A single-use ID representing a single person joining a single space.
   * This is assigned as soon as a user joins the space, even if they go to the waiting room.
   */
  sessionId: number;

  /**
   * An ID assigned to somebody when they join the Space
   * If a user joins as a guest from the browser, this ID stays with them even if they
   * join different spaces. If a user joins as a registered user, this is just their account id.
   */
  participantId: number;

  /**
   * Nickname to display for the user
   */
  displayName: string;

  /**
   * Color of the user's avatar
   */
  displayColor: string;

  /**
   * Anything from 'agree' to 'disagree' to 'go faster'
   */
  displayStatus: DisplayStatus;

  /**
   * Whether the user has been granted permission to present
   */
  canPresent: boolean;

  /**
   * Whether the user is allowed to turn on their microphone
   */
  canActivateMicrophone: boolean;

  /**
   * Whether the user is allowed to turn on their camera
   */
  canActivateCamera: boolean;

  /**
   * Whether the user is an administrator
   */
  isAdministrator: boolean;

  /**
   * Whether the user is a moderator
   */
  isModerator: boolean;

  /**
   * Whether the user is currently presenting
   */
  isPresenting: boolean;

  /**
   * Info about this user's location
   */
  position: SpacePositionInfo;
}

export interface SpaceCreationOptions {
  waitingRoom?: boolean;
  loginRequiredToJoin?: boolean;
  name: string;
  createdBy: string;
  isPublic: boolean;
}

export interface SpacePositionInfo {
  /**
   * Where the user is in the space.
   * This is a 2D location, because as of now, the spaces are "2.5-dimensional" worlds
   */
  location?: SpaceLocation;

  /**
   * The 2D rotation of the user
   */
  rotation?: number;
}

const SPACE_CACHE_EXPIRE_TIME = 60;
export class SpaceServer {
  /**
   * Key is equal to `participant.participantId`
   */
  participants = new Map<number, SpaceParticipant>();
  connections = new Map<number, Connection>();
  cachedSpace: Space;
  lastCacheLoadTime: -1;

  constructor(public io: SocketIOServer, public spaceId: number) {
    this.spaceId = spaceId;
  }

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

  deregisterParticipantFromSpace(participantId: number) {
    const { socket } = this.connections.get(participantId);

    socket.leave("space_" + this.spaceId);
    socket.removeAllListeners("chat_message");
  }

  addParticipantToSpace(participantId: number, participant: SpaceParticipant) {
    const { socket } = this.connections.get(participantId);

    this.participants.set(participantId, participant);

    socket.on("chat_message", (messageContent, channelId) => {
      this.io
        .in("space_" + this.spaceId)
        .emit("chat_message", messageContent, participantId);
    });

    socket.join("space_" + this.spaceId);
    socket.emit("space_join_complete");
    socket.emit("peer_info", participant);
    socket.emit("peers", this.participants);
    socket.broadcast.emit("peer_joined", participant);
  }

  tryJoin(socket: CustomSocket, displayName?: string) {
    const session = socket.request.session;
    const isLoggedIn = session.isLoggedIn ?? false;

    if (isLoggedIn) {
      const sessionId = nextId();
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
const spaceServers = new Map<number, SpaceServer>();

export function createSpaceServer(spaceId: number, io: SocketIOServer) {
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
  spaceId: number,
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
