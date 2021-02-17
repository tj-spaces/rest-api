import { createClient } from "redis";

// [redis[s]:]//[user:[password]@][host][:port][/db-number]
const url = "redis://127.0.0.1:6379";
export const redis = createClient(url);
