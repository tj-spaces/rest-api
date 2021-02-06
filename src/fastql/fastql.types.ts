import { getUserFromID, User } from "../database/tables/users";
import {
  getFriends,
  OutgoingRelationResult,
} from "../database/tables/user_relations";

export type ResolverFunction<P, T> = (parent: P) => T | Promise<T>;

export type Resolver<TrivialType> = {};

export type CustomResolver<TrivialType, Custom> = Resolver<TrivialType> &
  {
    [key in keyof Custom]: ResolverFunction<TrivialType, Custom[key]>;
  };

export type CustomTypes<Custom> = {
  [key in keyof Custom]: Resolver<Custom[key]>;
};

let userSchema: CustomTypes<CustomUserFields> = {
	friends: OutgoingRelationResultResolver
};

type CustomUserFields = 
{ friends: OutgoingRelationResult[] };

var OutgoingRelationResultResolver: CustomResolver<
  OutgoingRelationResult,
  { to_user: User }
> = {
	to_user: async (result) => (await getUserFromID(result.to_user));
};

let userResolver: CustomResolver<
  User, CustomUserFields
> = {
  friends: async (user) => (await getFriends({ from_user: user.id })).rows,
};

