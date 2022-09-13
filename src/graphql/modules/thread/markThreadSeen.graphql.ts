import { gql } from "apollo-server-express";
import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { notFoundHandler } from "../../../helpers/functions/notFoundHandler";
import { Context } from "../../context";
import { ThreadModel } from "./thread.model";
import { ThreadMessageModel } from "./threadMessage/threadMessage.model";

export default {
  schema: gql`
    extend type Query {
      markThreadSeen(threadId: ID!): Thread
    }
  `,
  resolver: {
    Query: {
      markThreadSeen: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);

        const { threadId } = args;
        const thread = notFoundHandler(await ThreadModel.findById(threadId));
        if (context.isMember() || context.isStaff()) {
          if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
        }
        if (context.isCustomer()) {
          if (thread.customerId.toString() != context.id) throw ErrorHelper.permissionDeny();
        }
        thread.seen = true;
        thread.seenAt = new Date();

        // mark all thread message seen
        await ThreadMessageModel.updateMany({ threadId }, { seen: true, seenAt: new Date() });

        return await thread.save();
      },
    },
  },
};
