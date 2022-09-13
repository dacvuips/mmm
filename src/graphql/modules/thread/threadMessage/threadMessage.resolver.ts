import _ from "lodash";

import { ErrorHelper } from "../../../../base/error";
import { ROLES } from "../../../../constants/role.const";
import { notFoundHandler } from "../../../../helpers/functions/notFoundHandler";
import { pubsub } from "../../../../helpers/pubsub";
import { Context } from "../../../context";
import { ThreadLoader } from "../thread.model";
import { IThreadMessage, ThreadMessageLoader } from "./threadMessage.model";
import { threadMessageService } from "./threadMessage.service";

const Query = {
  getAllThreadMessage: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (_.isEmpty(_.get(args, "q.filter.threadId"))) throw Error("Filter ThreadID is required");
    return threadMessageService.fetch(args.q);
  },
  getOneThreadMessage: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await threadMessageService.findOne({ _id: id });
  },
};

const Mutation = {
  createThreadMessage: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { data } = args;
    const { threadId, text } = data;

    const thread = notFoundHandler(await ThreadLoader.load(threadId));

    if (context.isMember() || context.isStaff()) {
      if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();

      data.sender = { role: ROLES.MEMBER, memberId: context.sellerId };
    }
    if (context.isCustomer()) {
      if (thread.customerId.toString() != context.id) throw ErrorHelper.permissionDeny();

      data.sender = { role: ROLES.CUSTOMER, customerId: context.id };
    }
    if (context.isAdmin() || context.isEditor()) {
      thread.userId = context.id;
      data.sender = { role: context.tokenData.role, userId: context.id };
    }

    const message: IThreadMessage = await threadMessageService.create(data);

    thread.snippet = _.truncate(text || `Đính kèm...`, { length: 30 });
    thread.lastMessageAt = message.createdAt;
    thread.messageId = message._id;
    thread.seen = false;

    await thread.save();

    pubsub.publish("thread", { thread, message });

    return message;
  },
  unsendMessage: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    const threadMessage = (await notFoundHandler(
      await threadMessageService.findOne({ _id: id })
    )) as IThreadMessage;
    await checkOwner(threadMessage, context);
    threadMessage.isUnsend = true;
    return await threadMessage.save();
  },
};

const ThreadMessage = {
  text: async (root: any, args: any, context: Context) => {
    return root.isUnsend ? "Tin nhắn đã thu hồi" : root.text;
  },
  attachment: async (root: any, args: any, context: Context) => {
    return root.isUnsend ? null : root.attachment;
  },
};

export default {
  Query,
  Mutation,
  ThreadMessage,
};

async function checkOwner(thread: IThreadMessage, context: Context) {
  if (thread?.sender?.role) {
    switch (thread.sender.role) {
      case ROLES.ADMIN:
        if (thread.sender.userId.toString() !== context.id.toString())
          throw ErrorHelper.permissionDeny();
        break;
      case ROLES.STAFF:
      case ROLES.MEMBER:
        if (thread.sender.memberId.toString() !== context.sellerId.toString())
          throw ErrorHelper.permissionDeny();
        break;
      case ROLES.CUSTOMER:
        if (thread.sender.customerId.toString() !== context.id.toString())
          throw ErrorHelper.permissionDeny();
        break;
      default:
        throw ErrorHelper.permissionDeny();
    }
    return true;
  }
  return false;
}
