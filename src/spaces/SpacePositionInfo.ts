/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
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
