import { gql } from "apollo-server-express";
import {
  createClusterInviteLink,
  getInviteLinkWithSlug,
} from "../database/tables/cluster_invite_links";

export const typeDef = gql`
  extend type Query {
    inviteLink(slug: String!): InviteLink
  }

  extend type Mutation {
    createInviteLink(clusterID: ID!, slug: String) {
      success: Boolean!
      slug: String
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
  Mutation: {
    createInviteLink: async function (
      _source: any,
      args: { clusterID: string; slug?: string }
    ): Promise<{ success: boolean; slug?: string }> {
      try {
        return await createClusterInviteLink(args.slug, args.clusterID);
      } catch (err) {
        return { success: false };
      }
    },
  },
};
