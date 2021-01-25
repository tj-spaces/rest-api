import { Cluster, getClusterById } from "../database/tables/clusters";
import {
  ClusterInviteLink,
  getInviteLinksWithClusterId,
} from "../database/tables/cluster_invite_links";
import {
  getClustersWithUser,
  getUsersInCluster,
} from "../database/tables/cluster_members";
import { getSpacesInCluster, Space } from "../database/tables/spaces";
import { getUserFromId, User } from "../database/tables/users";

export const resolvers = {
  Query: {
    cluster(obj: any, args: { id: string }): Promise<Cluster> {
      return getClusterById(args.id);
    },
  },
  Cluster: {
    spaces(obj: Cluster): Promise<Space[]> {
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
  User: {
    clusters(obj: User): Promise<Cluster[]> {
      return getClustersWithUser(obj.id);
    },
  },
};
