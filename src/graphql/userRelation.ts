import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  sendFriendRequest,
} from "../database/tables/user_relations";

export const typeDef = `

enum UserRelationType {
	friends
	blocked
	requested_friends
	following
	requested_to_follow
}

type UserRelation {
	from_user: User!
	to_user: User!
	relation_type: UserRelationType!
	created_at: String!
	updated_at: String!
}

extend type Query {
	get_friends: [UserRelation!]
	get_incoming_friend_requests: [UserRelation!]
	get_outgoing_friend_requests: [UserRelation!]
}

extend type Mutation {
	send_friend_request(other_user_id: ID!): Boolean
	deny_friend_request(other_user_id: ID!): Boolean
	accept_friend_request(other_user_id: ID!): Boolean
}

`;

export const resolvers = {
  Query: {
    get_friends(parent: any, args: {}, request: Express.Request) {
      let accountID = request.session.accountID;
      if (accountID == null) throw new Error("unauthorized");
      return getFriends({ from_user: accountID });
    },
    get_incoming_friend_requests(
      parent: any,
      args: {},
      request: Express.Request
    ) {
      let accountID = request.session.accountID;
      return getIncomingFriendRequests({ to_user: accountID });
    },
    get_outgoing_friend_requests(
      parent: any,
      args: {},
      request: Express.Request
    ) {
      let accountID = request.session.accountID;
      return getOutgoingFriendRequests({ from_user: accountID });
    },
  },
  Mutation: {
    send_friend_request(
      args: { other_user_id: string },
      request: Express.Request
    ) {
      let accountID = request.session.accountID;
      if (accountID === args.other_user_id) {
        throw new Error("Cannot add yourself as a friend");
      } else {
        sendFriendRequest(accountID, args.other_user_id);
      }
    },
    deny_friend_request(
      args: { other_user_id: string },
      request: Express.Request
    ) {
      let accountID = request.session.accountID;
      if (accountID === args.other_user_id) {
        throw new Error("Cannot add yourself as a friend");
      } else {
      }
    },
    accept_friend_request(
      args: { other_user_id: string },
      request: Express.Request
    ) {
      let accountID = request.session.accountID;
      if (accountID === args.other_user_id) {
        throw new Error("Cannot add yourself as a friend");
      }
    },
  },
};
