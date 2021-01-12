import createUuid from "./lib/createUuid";
import { Ping } from "./ping";
import { CustomSocket } from "./socket";

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
   * An ID assigned to somebody when they join the Space
   * If a user joins as a guest from the browser, this ID stays with them even if they
   * join different spaces. If a user joins as a registered user, this is just their account id.
   */
  temporaryId: string;

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
  waitingRoom: boolean;
  loginRequiredToJoin: boolean;
}

export class SpaceConnection {
  ping: Ping;
  constructor(public socket: CustomSocket) {}
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
   * Key is equal to `inhabitant.temporaryId`
   */
  inhabitants: Map<string, SpaceInhabitant>;

  connections: Map<string, SpaceConnection>;

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
        displayColor: this.getDefaultDisplayColor(),
        displayName: this.getDefaultDisplayName(),
        displayStatus: this.getDefaultDisplayStatus(),
        canPresent: this.getDefaultCanPresent(),
        canActivateCamera: this.getDefaultCanActivateCamera(),
        canActivateMicrophone: this.getDefaultCanActivateMicrophone(),
        isAdministrator: false,
        isModerator: false,
        isPresenting: false,
        position: this.getJoinPosition(),
      };

      if (this.isWaitingRoomEnabled) {
        this.inhabitantsInWaitingRoom.set(temporaryId, inhabitant);
        socket.emit("in_waiting_room");
      } else {
        this.inhabitants.set(temporaryId, inhabitant);
        socket.join("space_" + this.spaceId);
        socket.broadcast.emit("peer_joined", inhabitant);
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
