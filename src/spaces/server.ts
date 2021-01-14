import createUuid from "../lib/createUuid";
import { CustomSocket } from "../socket";
import { Server as SocketIOServer } from "socket.io";
import isDevelopmentMode from "../lib/isDevelopment";
import { nextId } from "../lib/snowflakeId";

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
   * Users can log in as Guests in some spaces. This can be turned off
   */
  isGuest: boolean;

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

export class SpaceConnection {
  /**
   * UNIX time for when the last ping was sent
   */
  lastPingSendTime?: number;

  /**
   * UNIX time for when the last ping was received
   */
  lastPingReceiveTime?: number;

  /**
   * Key for the last ping
   */
  pingKey: string;

  latency: number = 0;

  constructor(public socket: CustomSocket) {
    socket.on("ping", (key) => {
      if (key === this.pingKey) {
        this.lastPingReceiveTime = Date.now();
        this.latency = this.lastPingReceiveTime - this.lastPingSendTime;

        // Send a max of one ping every 500 ms
        let timeToWaitUntilNextPing = Math.max(0, 500 - this.latency);
        setTimeout(() => this.sendPing(), timeToWaitUntilNextPing);
      }
    });

    if (!isDevelopmentMode()) {
      this.sendPing();
    }
  }

  sendPing() {
    this.pingKey = createUuid();
    this.lastPingSendTime = Date.now();
    this.socket.emit("ping", this.pingKey, this.latency);
  }
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

export class Space {
  /**
   * Key is equal to `participant.participantId`
   */
  participants = new Map<number, SpaceParticipant>();

  connections = new Map<number, SpaceConnection>();

  isWaitingRoomEnabled: boolean;
  participantsInWaitingRoom = new Map<number, SpaceParticipant>();
  participantsThatWereKicked = new Set<number>();

  isLoginRequiredToJoin: boolean;

  name: string;
  createdBy: string;

  isPublic: boolean;

  constructor(
    {
      waitingRoom = true,
      loginRequiredToJoin = false,
      name,
      createdBy,
      isPublic,
    }: SpaceCreationOptions,
    public io: SocketIOServer,
    public spaceId: number
  ) {
    this.isWaitingRoomEnabled = waitingRoom;
    this.isLoginRequiredToJoin = loginRequiredToJoin;
    this.spaceId = spaceId;
    this.name = name;
    this.createdBy = createdBy;
    this.isPublic = isPublic;
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

  broadcastParticipants() {}

  addParticipantToWaitingRoom(
    participantId: number,
    participant: SpaceParticipant
  ) {
    const { socket } = this.connections.get(participantId);

    this.participantsInWaitingRoom.set(participantId, participant);
    socket.emit("in_waiting_room");
  }

  deregisterParticipantFromSpace(participantId: number) {
    const { socket } = this.connections.get(participantId);

    socket.leave("space_" + this.spaceId);
    socket.removeAllListeners("chat_message");
  }

  addParticipantToSpace(participantId: number, participant: SpaceParticipant) {
    const { socket } = this.connections.get(participantId);

    this.participants.set(participantId, participant);

    socket.on("chat_message", (messageContent) => {
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

  /**
   * Admits a participant from the waiting room
   * @param participantId The participant to admit
   */
  admitWaitingRoomParticipant(participantId: number) {
    if (this.participantsInWaitingRoom.has(participantId)) {
      const participant = this.participantsInWaitingRoom.get(participantId);

      // Remove from the waiting room
      this.participantsInWaitingRoom.delete(participantId);

      this.addParticipantToSpace(participantId, participant);
    }
  }

  /**
   * Denies a participant from the waiting room
   * @param participantId The participant to deny
   */
  denyWaitingRoomParticipant(participantId: number) {
    if (this.participantsInWaitingRoom.has(participantId)) {
      this.participantsInWaitingRoom.delete(participantId);
      const { socket } = this.connections.get(participantId);
      socket.emit("space_join_denied");
    }
  }

  tryJoin(socket: CustomSocket, displayName?: string) {
    const session = socket.request.session;
    const isLoggedIn = session.isLoggedIn ?? false;

    if (!this.isLoginRequiredToJoin || isLoggedIn) {
      const sessionId = nextId();
      const participantId = isLoggedIn ? session.accountId : nextId();
      if (participantId == null) {
        throw new Error("participantId is NULL");
      }

      const participant: SpaceParticipant = {
        sessionId,
        participantId,
        isGuest: !isLoggedIn,
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

      this.connections.set(participantId, new SpaceConnection(socket));

      if (this.isWaitingRoomEnabled) {
        this.addParticipantToWaitingRoom(participantId, participant);
      } else {
        this.addParticipantToSpace(participantId, participant);
      }
    }
  }
}

/**
 * For internal use only. The key is the space id.
 */
const spaces = new Map<number, Space>();

export function createSpace(
  spaceId: number,
  options: SpaceCreationOptions,
  io: SocketIOServer
) {
  spaces.set(spaceId, new Space(options, io, spaceId));
}

export function getPublicSpaces(): Space[] {
  return Array.from(spaces.values()).filter((space) => space.isPublic);
}

export function getSpace(spaceId: number): Space | null {
  if (spaces.has(spaceId)) {
    return spaces.get(spaceId);
  } else {
    return null;
  }
}
