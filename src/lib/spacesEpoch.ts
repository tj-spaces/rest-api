export const SPACES_EPOCH = 1609459200; // 01-01-2021 UTC

export function getTimeSinceSpacesEpoch() {
  return Date.now() - SPACES_EPOCH;
}
