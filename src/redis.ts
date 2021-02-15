import * as redis from "redis";

// [redis[s]:]//[[user][:password@]][host][:port][/db-number]
const redisUrl = "";
export const pub = redis.createClient(redisUrl);
export const sub = redis.createClient(redisUrl);
