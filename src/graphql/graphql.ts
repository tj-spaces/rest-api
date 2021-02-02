import { makeExecutableSchema } from "graphql-tools";
import * as cluster from "./cluster";
import * as group from "./group";
import * as inviteLink from "./inviteLink";
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
