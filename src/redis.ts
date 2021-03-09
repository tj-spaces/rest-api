/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { createClient } from "redis";

console.log("Connecting to Redis...");

// [redis[s]:]//[user:[password]@][host][:port][/db-number]
export const redis = createClient(process.env.REDIS_URL);

console.log("Connected to Redis.");
