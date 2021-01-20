/**
 * Snowflakes are unique IDs used by Twitter and Discord that have the guarantee that if one
 * Snowflake is less than another Snowflake, it was created before.
 * See https://discord.com/developers/docs/reference --> Snowflake section
 */

import { getTimeSinceSpacesEpoch } from "./spacesEpoch";

export class SnowflakeProcess {
  private lastTimestamp = -1;
  private generatedThisMillis = 0;
  private generatedThisMillisMask = (1 << 12) - 1;
  private static timestampLeftShift = 42;
  private static workerIdLeftShift = 17;
  private static processIdLeftShift = 12;

  constructor(private workerId: number, private processId: number) {}

  createUuid() {
    let timestamp = getTimeSinceSpacesEpoch();

    if (this.lastTimestamp == timestamp) {
      this.generatedThisMillis =
        (this.generatedThisMillis + 1) & this.generatedThisMillisMask;
      if (this.generatedThisMillis == 0) {
        this.waitUntil(this.lastTimestamp + 1);
      }
    } else if (timestamp > this.lastTimestamp) {
      this.generatedThisMillis = 0;
    }

    this.lastTimestamp = timestamp;

    return (
      (timestamp << SnowflakeProcess.timestampLeftShift) |
      (this.workerId << SnowflakeProcess.workerIdLeftShift) |
      (this.processId << SnowflakeProcess.processIdLeftShift) |
      this.generatedThisMillis
    );
  }

  private waitUntil(targetTime: number) {
    while (getTimeSinceSpacesEpoch() < targetTime) {}
  }
}

const __process = new SnowflakeProcess(0, 0);

export function nextId() {
  return __process.createUuid();
}
