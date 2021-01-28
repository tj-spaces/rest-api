import { DisplayStatus } from "./DisplayStatus";
import { SpacePositionInfo } from "./SpacePositionInfo";

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
  sessionId?: string;

  /**
   * An ID assigned to somebody when they join the Space
   * If a user joins as a guest from the browser, this ID stays with them even if they
   * join different spaces. If a user joins as a registered user, this is just their account id.
   */
  accountId: string;

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

  rotateDirection: 0 | 1 | -1;
  moveDirection: 0 | 1 | -1;
}
