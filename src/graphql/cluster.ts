import {
  ClusterInviteLink,
  getInviteLinksWithClusterId,
} from "../database/tables/cluster_invite_links";
import {
  Cluster,
  ClusterVisibility,
  createCluster,
  getClusterById,
} from "../database/tables/clusters";
import { getUsersInCluster } from "../database/tables/cluster_members";
import {
  getActiveSpaceSessionsInCluster,
  BaseSpace,
} from "../database/tables/space_sessions";
import { getUserFromId, User } from "../database/tables/users";

export const typeDef = `
  type Query {
    cluster(id: ID!): Cluster
  }

  type Mutation {
    createCluster(name: String!, visibility: ClusterVisibility!): Cluster
  }

  enum ClusterVisibility {
    public
    unlisted
  }

  type Cluster {
    id: ID!
    creator: User!
    name: String!
    visibility: ClusterVisibility
    spaces: [Space!]!
    members: [User!]!
    invite_links: [InviteLink!]!
  }
`;

export const resolvers = {
  Query: {
    cluster(source: any, args: { id: string }) {
      return getClusterById(args.id);
    },
  },
  Mutation: {
    createCluster(
      source: any,
      args: { name: string; visibility: ClusterVisibility },
      context
    ) {
      let creatorId = context.request.session.accountId;
      createCluster(creatorId, args.name, args.visibility);
    },
  },
  Cluster: {
    spaces(obj: Cluster): Promise<BaseSpace[]> {
      return getActiveSpaceSessionsInCluster(obj.id);
    },
    async members(obj: Cluster): Promise<User[]> {
      const ids = await getUsersInCluster(obj.id);
      return await Promise.all(ids.map((id) => getUserFromId(id)));
    },
    invite_links(obj: Cluster): Promise<ClusterInviteLink[]> {
      return getInviteLinksWithClusterId(obj.id);
    },
  },
};
