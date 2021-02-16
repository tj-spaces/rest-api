import {
  ClusterVisibility,
  doesClusterExist,
} from "../database/tables/clusters";
import { didUserJoinCluster } from "../database/tables/cluster_members";
import { SpaceVisibility } from "../database/tables/spaces";
import {
  getUserRelationType,
  UserRelationType,
} from "../database/tables/user_relations";
import {
  InvalidArgumentError,
  ResourceNotFoundError,
  UnauthorizedError,
  WrongRelationTypeError,
} from "./errors";

export function validateString(
  value: unknown,
  minLength: number,
  maxLength: number
): value is string {
  if (typeof value !== "string") return false;
  return value.length >= minLength && value.length <= maxLength;
}

export function assertString(
  value: unknown,
  minLength: number,
  maxLength: number
): asserts value is string {
  if (!validateString(value, minLength, maxLength)) {
    throw new InvalidArgumentError();
  }
}

export function validateNumber(
  value: unknown,
  minVal: number,
  maxVal: number
): value is number {
  if (typeof value !== "number") return false;
  return value >= minVal && value <= maxVal;
}

export function assertNumber(
  value: unknown,
  minVal: number,
  maxVal: number
): asserts value is number {
  if (!validateNumber(value, minVal, maxVal)) {
    throw new InvalidArgumentError();
  }
}

const stringIDRegex = /^\d+$/;
export function validateStringID(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return stringIDRegex.test(value);
}

export function assertStringID(value: unknown): asserts value is string {
  if (!validateStringID(value)) {
    throw new InvalidArgumentError();
  }
}

export function assertClusterVisibility(
  value: unknown
): asserts value is ClusterVisibility {
  if (typeof value === "string") {
    if (
      value === "discoverable" ||
      value === "unlisted" ||
      value === "secret"
    ) {
      return;
    }
  }
  throw new InvalidArgumentError();
}

export function assertSpaceVisibility(
  value: unknown
): asserts value is SpaceVisibility {
  if (typeof value === "string") {
    if (
      value === "discoverable" ||
      value === "unlisted" ||
      value === "secret"
    ) {
      return;
    }
  }
  throw new InvalidArgumentError();
}

export async function assertClusterExists(clusterID: string) {
  const clusterExists = await doesClusterExist(clusterID);
  if (!clusterExists) {
    throw new ResourceNotFoundError();
  }
}

export async function assertUserJoinedCluster(
  clusterID: string,
  accountID: string
) {
  const inCluster = await didUserJoinCluster(clusterID, accountID);
  if (!inCluster) {
    throw new UnauthorizedError();
  }
}

export async function assertRelationIs(
  fromUser: string,
  toUser: string,
  relationType: UserRelationType
) {
  const foundRelationType = await getUserRelationType({
    from_user: fromUser,
    to_user: toUser,
  });
  if (foundRelationType !== relationType) {
    throw new WrongRelationTypeError();
  }
}

export async function assertRelationIsNot(
  fromUser: string,
  toUser: string,
  relationType: UserRelationType
) {
  const foundRelationType = await getUserRelationType({
    from_user: fromUser,
    to_user: toUser,
  });
  if (foundRelationType === relationType) {
    throw new WrongRelationTypeError();
  }
}
