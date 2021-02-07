import { Cluster, getClusterByID } from "../database/tables/clusters";
import {
  getSpaceSessionByID,
  SpaceSession,
  SpaceSessionVisibility,
  startSpaceSession,
} from "../database/tables/space_sessions";
import { getConnectionCount } from "../spaces/server";

export const typeDef = `
  extend type Query {
    space(id: ID!): Space
  }

  extend type Mutation {
    startSession(name: String): String
  }

  interface Space {
    id: ID!
    name: String!
    active_user_count: Int!
    cluster: Cluster
  }
`;

export const resolvers = {
  Query: {
    space(source: any, args: { id: string }): Promise<SpaceSession> {
      return getSpaceSessionByID(args.id, false);
    },
  },
  Mutation: {
    startSession(
      source: any,
      args: { name: string; visibility: SpaceSessionVisibility }
    ): Promise<string> {
      return startSpaceSession("1234", args.name, args.visibility);
    },
  },
  Space: {
    active_user_count(source: SpaceSession) {
      return getConnectionCount(source.id);
    },
    cluster(source: SpaceSession): Promise<Cluster> {
      if (!("cluster_id" in source)) {
        throw new Error("This Space has no cluster");
      }
      return getClusterByID(source.cluster_id);
    },
  },
};
