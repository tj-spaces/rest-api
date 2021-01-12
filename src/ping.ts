export interface Ping {
  /**
   * UNIX time for when the last ping was sent
   */
  lastPingSendTime?: number;

  /**
   * UNIX time for when the last ping was received
   */
  lastPingReceiveTime?: number;

  /**
   * Key for the last ping
   */
  lastPingKey?: string;
}
