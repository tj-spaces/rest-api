import {
  ClusterInviteLink,
  getInviteLinksWithClusterId,
} from "../database/tables/cluster_invite_links";
import { Cluster } from "../database/tables/clusters";
import { getUsersInCluster } from "../database/tables/cluster_members";
import { getSpacesInCluster, BaseSpace } from "../database/tables/spaces";
import { getUserFromId, User } from "../database/tables/users";
import { gql } from "apollo-server-express";

export const typeDef = gql`
  extend type Query {
    cluster(id: ID!): Cluster
  }

  enum ClusterVisibility {
    public
    unlisted
  }

  type Cluster {
    id: ID!
    creator: User!
    name: String!
    created_at: String!
    updated_at: String!
    visibility: ClusterVisibility
    spaces: [Space!]!
    members: [User!]!
  }
`;

export const resolvers = {
  Cluster: {
    spaces(obj: Cluster): Promise<BaseSpace[]> {
      return getSpacesInCluster(obj.id);
    },
    async members(obj: Cluster): Promise<User[]> {
      const ids = await getUsersInCluster(obj.id);
      return await Promise.all(ids.map((id) => getUserFromId(id)));
    },
    inviteLinks(obj: Cluster): Promise<ClusterInviteLink[]> {
      return getInviteLinksWithClusterId(obj.id);
    },
  },
};
