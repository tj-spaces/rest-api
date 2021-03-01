import { createClient } from "redis";

// [redis[s]:]//[user:[password]@][host][:port][/db-number]
export const redis = createClient(process.env.REDIS_URL);
