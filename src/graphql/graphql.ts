import { makeExecutableSchema } from "apollo-server-express";

import * as cluster from "./cluster";
import * as inviteLink from "./inviteLink";
import * as user from "./user";

export const executableSchema = makeExecutableSchema({
  typeDefs: [cluster.typeDef, inviteLink.typeDef, user.typeDef],
  resolvers: [cluster.resolvers, inviteLink.resolvers, user.resolvers],
});
