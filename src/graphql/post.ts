const gql = <T>(a: T) => a;

export const typeDefs = gql`
  type Post {
    id: ID!
  }
`;
