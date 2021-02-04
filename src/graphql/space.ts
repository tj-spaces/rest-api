import { Cluster, getClusterById } from "../database/tables/clusters";
import {
  ClusterSpace,
  getSpaceById,
  BaseSpace,
  SpaceSession,
} from "../database/tables/space_sessions";
import { getConnectionCount } from "../spaces/server";

export const typeDef = `
  extend type Query {
    space(id: ID!): Space
  }

  interface Space {
    id: ID!
    color: String!
    name: String!
    active_user_count: Int!
  }

  type ClusterSpace implements Space {
    id: ID!
    color: String!
    name: String!
    active_user_count: Int!
    cluster: Cluster!
  }
`;

export const resolvers = {
  Query: {
    space(source: any, args: { id: string }): Promise<SpaceSession> {
      return getSpaceById(args.id);
    },
  },
  Space: {
    active_user_count(source: SpaceSession) {
      return getConnectionCount(source.id);
    },
    __resolveType(source: SpaceSession) {
      if (source.type === "cluster") {
        return "ClusterSpace";
      } else {
        throw new Error("Invalid source.type: " + source.type);
      }
    },
  },
  ClusterSpace: {
    active_user_count(source: ClusterSpace) {
      return getConnectionCount(source.id);
    },
    cluster(source: ClusterSpace): Promise<Cluster> {
      return getClusterById(source.cluster_id);
    },
  },
};
