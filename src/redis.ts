import { createClient } from "redis";

console.log("Connecting to Redis...");

// [redis[s]:]//[user:[password]@][host][:port][/db-number]
export const redis = createClient(process.env.REDIS_URL);

console.log("Connected to Redis.");
