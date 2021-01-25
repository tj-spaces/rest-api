import { gql } from "apollo-server-express";
import { getInviteLinkWithSlug } from "../database/tables/cluster_invite_links";

export const typeDef = gql`
  extend type Query {
    inviteLink(slug: String!): InviteLink
  }

  extend type Mutation {
    createInviteLink(clusterID: String!, slug: String) {
      
    }
  }

  type InviteLink {
    id: ID!
    slug: String!
    cluster_id: ID!
  }
`;

export const resolvers = {
  Query: {
    inviteLink: function (source: any, args: { slug: string }) {
      return getInviteLinkWithSlug(args.slug);
    },
  },

  InviteLink: {},
};
