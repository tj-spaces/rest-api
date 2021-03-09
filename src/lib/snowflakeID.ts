/*
  Method is created by Twitter.
*/

/**
 * Snowflakes are unique IDs used by Twitter and Discord that have the guarantee that if one
 * Snowflake is less than another Snowflake, it was created before.
 * See https://discord.com/developers/docs/reference --> Snowflake section
 */

import { getTimeSinceSpacesEpoch } from "./spacesEpoch";

export class SnowflakeProcess {
  private lastTimestamp = BigInt(-1);
  private generatedThisMillis = 0;
  private generatedThisMillisMask = (1 << 12) - 1;
  private static timestampLeftShift = BigInt(22);
  private static nodeIDLeftShift = BigInt(10);

  constructor(private nodeID: number) {}

  generateSnowflake() {
    let timestamp = BigInt(getTimeSinceSpacesEpoch()) >> BigInt(1);

    if (this.lastTimestamp == timestamp) {
      this.generatedThisMillis =
        (this.generatedThisMillis + 1) & this.generatedThisMillisMask;
      if (this.generatedThisMillis == 0) {
        this.waitUntil(++this.lastTimestamp);
      }
    } else if (timestamp > this.lastTimestamp) {
      this.generatedThisMillis = 0;
    }

    this.lastTimestamp = timestamp;

    return (
      (BigInt(timestamp) << SnowflakeProcess.timestampLeftShift) |
      (BigInt(this.nodeID) << SnowflakeProcess.nodeIDLeftShift) |
      BigInt(this.generatedThisMillis)
    );
  }

  private waitUntil(targetTime: BigInt) {
    while (BigInt(getTimeSinceSpacesEpoch()) < targetTime) {}
  }
}

const __process = new SnowflakeProcess(0);

export function nextID() {
  return __process.generateSnowflake();
}
