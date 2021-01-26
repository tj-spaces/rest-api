import { gql } from "apollo-server-express";
import { Cluster, getClusterById } from "../database/tables/clusters";
import {
  ClusterSpace,
  getSpaceById,
  BaseSpace,
} from "../database/tables/spaces";
import { getConnectionCount } from "../spaces/server";

export const typeDef = gql`
  extend type Query {
    space(id: ID!): Space
  }

  interface Space {
    id: ID!
    color: String!
    activeUsers: Int!
  }

  type ClusterSpace implements Space {
    cluster: Cluster!
  }
`;

export const resolvers = {
  Query: {
    space(id: string): Promise<BaseSpace> {
      return getSpaceById(id);
    },
  },
  Space: {
    activeUsers(source: BaseSpace) {
      return getConnectionCount(source.id);
    },
  },
  ClusterSpace: {
    cluster(source: ClusterSpace): Promise<Cluster> {
      return getClusterById(source.cluster_id);
    },
  },
};
