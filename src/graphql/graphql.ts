import { gql, makeExecutableSchema } from "apollo-server-express";

import * as cluster from "./cluster";
import * as inviteLink from "./inviteLink";
import * as group from "./group";
import * as space from "./space";
import * as user from "./user";

export const executableSchema = makeExecutableSchema({
  typeDefs: [
    cluster.typeDef,
    inviteLink.typeDef,
    group.typeDef,
    space.typeDef,
    user.typeDef,
  ],
  resolvers: [
    cluster.resolvers,
    inviteLink.resolvers,
    space.resolvers,
    user.resolvers,
  ],
});
