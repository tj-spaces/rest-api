import { Cluster, getClusterByID } from "../database/tables/clusters";
import {
  ClusterInviteLink,
  getInviteLinksWithClusterID,
} from "../database/tables/cluster_invite_links";
import {
  getClustersWithUser,
  getUsersInCluster,
} from "../database/tables/cluster_members";
import {
  getActiveSpaceSessionsInCluster,
  SpaceSession,
} from "../database/tables/space_sessions";
import { getUserFromID, User } from "../database/tables/users";

export const resolvers = {
  Query: {
    cluster(obj: any, args: { id: string }): Promise<Cluster> {
      return getClusterByID(args.id);
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
    inviteLinks(obj: Cluster): Promise<ClusterInviteLink[]> {
      return getInviteLinksWithClusterID(obj.id);
    },
  },
  User: {
    clusters(obj: User): Promise<Cluster[]> {
      return getClustersWithUser(obj.id);
    },
  },
};
