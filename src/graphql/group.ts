import { gql } from "apollo-server-express";

export const typeDefs = gql`
  extend type Query {
    group(id: ID!): Group
  }

  type Group {
    id: ID!
    name: String
    picture: String
    members: [User]
  }
`;
