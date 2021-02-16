import { Space } from "../database/tables/spaces";

export interface SpaceServerInstance {
  /**
   * The underlying space
   */
  space: Space;

  /**
   * A unique ID for this SpaceSession
   */
  sessionID: string;

  /**
   * Describes how the space should be presented to the attendee
   */
  mode: "3d" | "2d" | "1d";

  /**
   * Whether participants can use spatial audio
   */
  useSpatialAudio: boolean;

  /**
   * A password that outside participants must use to join
   */
  password?: string;
}
