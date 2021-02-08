// import { makeExecutableSchema } from "graphql-tools";
import * as cluster from "./cluster";
import * as inviteLink from "./inviteLink";
import * as space from "./spaceSession";
import * as user from "./user";
import * as userRelation from "./userRelation";

/*
export const executableSchema = makeExecutableSchema({
  typeDefs: [
    cluster.typeDef,
    inviteLink.typeDef,
    space.typeDef,
    user.typeDef,
    userRelation.typeDef,
  ],
  resolvers: [
    cluster.resolvers,
    inviteLink.resolvers,
    space.resolvers,
    user.resolvers,
    userRelation.resolvers,
  ],
});
*/
