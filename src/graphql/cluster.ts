import {
  ClusterInviteLink,
  getInviteLinksWithClusterID,
} from "../database/tables/cluster_invite_links";
import {
  Cluster,
  ClusterVisibility,
  createCluster,
  getClusterByID,
} from "../database/tables/clusters";
import { getUsersInCluster } from "../database/tables/cluster_members";
import {
  getActiveSpaceSessionsInCluster,
  SpaceSession,
} from "../database/tables/space_sessions";
import { getUserFromID, User } from "../database/tables/users";

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
      return getClusterByID(args.id);
    },
  },
  Mutation: {
    createCluster(
      source: any,
      args: { name: string; visibility: ClusterVisibility },
      context
    ) {
      let creatorID = context.request.session.accountID;
      createCluster(creatorID, args.name, args.visibility);
    },
  },
  Cluster: {
    spaces(obj: Cluster): Promise<SpaceSession[]> {
      return getActiveSpaceSessionsInCluster(obj.id);
    },
    async members(obj: Cluster): Promise<User[]> {
      const ids = await getUsersInCluster(obj.id);
      return await Promise.all(ids.map((id) => getUserFromID(id)));
    },
    invite_links(obj: Cluster): Promise<ClusterInviteLink[]> {
      return getInviteLinksWithClusterID(obj.id);
    },
  },
};
