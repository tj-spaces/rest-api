import { gql } from "apollo-server-express";
import {
  ClusterInviteLink,
  createClusterInviteLink,
  getInviteLinkWithSlug,
} from "../database/tables/cluster_invite_links";

export const typeDef = gql`
  extend type Query {
    inviteLink(slug: String!): InviteLink
  }

  type Mutation {
    createInviteLink(clusterID: ID!, slug: String): InviteLink
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
    ): Promise<ClusterInviteLink> {
      const { success, slug } = await createClusterInviteLink(
        args.slug,
        args.clusterID
      );

      if (!success) {
        throw new Error();
      } else {
        return await getInviteLinkWithSlug(slug);
      }
    },
  },
};
