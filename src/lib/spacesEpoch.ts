/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
export const SPACES_EPOCH = 1609459200; // 01-01-2021 UTC

export function getTimeSinceSpacesEpoch() {
  return Date.now() - SPACES_EPOCH;
}
