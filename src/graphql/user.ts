import { Cluster } from "../database/tables/clusters";
import { getClustersWithUser } from "../database/tables/cluster_members";
import { getUserFromID, User } from "../database/tables/users";

export const typeDef = `
  extend type Query {
    user(id: ID!): User
  }

  type User {
    id: ID!
    email: String!
    verified_email: Boolean
    name: String
    given_name: String
    family_name: String
    picture: String
    locale: String
    clusters: [Cluster]
  }
`;

export const resolvers = {
  Query: {
    user(source: any, args: { id: string }): Promise<User> {
      return getUserFromID(args.id);
    },
  },
  User: {
    clusters(source: User): Promise<Cluster[]> {
      return getClustersWithUser(source.id);
    },
  },
};
