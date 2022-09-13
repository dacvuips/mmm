import { gql } from "apollo-server-express";
import { withFilter } from "graphql-subscriptions";

import { ROLES } from "../../../constants/role.const";
import { pubsub } from "../../../helpers/pubsub";
import { Context } from "../../context";
import { ThreadModel } from "./thread.model";
import { ThreadMessageModel } from "./threadMessage/threadMessage.model";

export default {
  schema: gql`
    extend type Subscription {
      threadStream: ThreadStreamData
    }

    type ThreadStreamData {
      thread: Thread
      message: ThreadMessage
    }
  `,
  resolver: {
    Subscription: {
      threadStream: {
        resolve: (payload: any) => ({
          thread: ThreadModel.hydrate(payload.thread),
          message: ThreadMessageModel.hydrate(payload.message),
        }),
        subscribe: withFilter(
          (root: any, args: any, context: Context) => {
            context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
            return pubsub.asyncIterator(["thread"]);
          },
          async (payload: any, args: any, context: Context) => {
            const { thread } = payload;
            if (context.isCustomer()) {
              return thread.customerId.toString() == context.id;
            }
            if (context.isMember()) {
              return thread.memberId.toString() == context.id;
            }
            if (context.isAdmin() || context.isEditor()) {
              return thread.userId.toString() == context.id;
            }
            return true;
          }
        ),
      },
    },
  },
};
