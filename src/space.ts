import createUuid from "./lib/createUuid";
import { Socket } from "socket.io";
import { CustomSocket } from "./socket";

/**
 * Where the user is in the space.
 * This is a 2D location, because as of now, the spaces are "2.5-dimensional" worlds
 */
export interface SpaceLocation {
  x: number;
  y: number;
}

/**
 * An Inhabitant in a space is anybody in the space that is either a guest or a user with an account.
 * This is not the same as an Account, which holds necessary information such as a user's email, username,
 * birthday, and etc.
 */
export interface SpaceInhabitant {
  /**
   * A single-use ID representing a single person joining a single space.
   * This is assigned as soon as a user joins the space, even if they go to the waiting room.
   */
  sessionId: string;

  /**
   * A single-use ID assigned to somebody when they join the Space
   * If a user joins as a guest from the browser, this ID stays with them even if they
   * join different spaces
   */
  temporaryId: string;

  /**
   * The ID of the account this user logged in with
   */
  accountId?: string;

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
  displayStatus:
    | "agree"
    | "disagree"
    | "faster"
    | "slower"
    | "raised-hand"
    | "none";

  /**
   * Whether the user has been granted permission to present
   */
  canPresent: boolean;

  /**
   * Whether the user is an administrator
   */
  isAdministrator: boolean;

  /**
   * Whether the user is a moderator
   */
  isModerator: boolean;

  /**
   * Whether the user has been muted by a moderator or administrator
   */
  isForceMuted: boolean;

  /**
   * Whether the user is currently presenting
   */
  isPresenting: boolean;

  /**
   * Where the user is in the space.
   * This is a 2D location, because as of now, the spaces are "2.5-dimensional" worlds
   */
  location?: SpaceLocation;

  /**
   * The 2D rotation of the user
   */
  rotation?: number;

  /**
   * UNIX time for when the last ping was sent
   */
  lastPingSendTime: number;

  /**
   * UNIX time for when the last ping was received
   */
  lastPingReceiveTime: number;

  /**
   * The Socket.io connection to this user
   */
  socket: SocketIO.Socket;
}

export interface SpaceCreationOptions {
  waitingRoom: boolean;
  loginRequiredToJoin: boolean;
}

export class Space {
  /**
   * Key is equal to `inhabitant.temporaryId`
   */
  inhabitants: Map<string, SpaceInhabitant>;

  isWaitingRoomEnabled: boolean;
  inhabitantsInWaitingRoom: Map<string, SpaceInhabitant>;
  inhabitantsThatWereKicked: string[];

  isLoginRequiredToJoin: boolean;

  spaceId: string;

  constructor({
    waitingRoom = true,
    loginRequiredToJoin = false,
  }: SpaceCreationOptions) {
    this.isWaitingRoomEnabled = waitingRoom;
    this.isLoginRequiredToJoin = loginRequiredToJoin;
  }

  tryJoin(socket: CustomSocket) {
    const session = socket.request.session;
    const isLoggedIn = session.isLoggedIn ?? false;

    if (!this.isLoginRequiredToJoin || isLoggedIn) {
      const sessionId = createUuid();
      const temporaryId = session.temporaryId;
      if (temporaryId == null) {
        throw new Error("temporaryId is NULL");
      }

      const inhabitant: SpaceInhabitant = {
        sessionId,
        temporaryId: session.temporaryId,
        isGuest: !isLoggedIn,
        displayColor: "red",
        displayName: "User",
        displayStatus: "none",
        canPresent: false,
        isAdministrator: false,
        isModerator: false,
        isForceMuted: false,
        isPresenting: false,
        lastPingReceiveTime: 0,
        lastPingSendTime: 0,
        socket,
      };

      if (this.isWaitingRoomEnabled) {
        this.inhabitantsInWaitingRoom.set(temporaryId, inhabitant);
        socket.emit("in_waiting_room");
      } else {
        this.inhabitants.set(temporaryId, inhabitant);
        socket.broadcast.emit("peer_joined");
      }
    }
  }
}

/**
 * For internal use only. The key is the space id.
 */
const spaces = new Map<string, Space>();

export function getSpace(spaceId: string): Space | null {
  if (spaces.has(spaceId)) {
    return spaces.get(spaceId);
  } else {
    return null;
  }
}
