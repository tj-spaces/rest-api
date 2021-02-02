export const typeDef = `
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
