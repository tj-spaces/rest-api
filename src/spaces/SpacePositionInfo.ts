import { SpaceLocation } from "./SpaceLocation";

export interface SpacePositionInfo {
  /**
   * Where the user is in the space.
   * This is a 3D location
   */
  location: SpaceLocation;

  /**
   * The 2D rotation of the user. For now, no up/down rotation
   */
  rotation: number;
}
