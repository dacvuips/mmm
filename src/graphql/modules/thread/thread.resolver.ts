import _ from "lodash";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper, ErrorHelper } from "../../../helpers";
import { notFoundHandler } from "../../../helpers/functions/notFoundHandler";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { CustomerLoader } from "../customer/customer.model";
import { MemberLoader } from "../member/member.model";
import { UserLoader } from "../user/user.model";
import { IThread, ThreadLoader, ThreadModel } from "./thread.model";
import { threadService } from "./thread.service";
import { ThreadChannel, ThreadStatus } from "./thread.type";
import { IThreadLabel, ThreadLabelLoader } from "./threadLabel/threadLabel.model";
import { threadLabelService } from "./threadLabel/threadLabel.service";
import { ThreadMessageLoader } from "./threadMessage/threadMessage.model";

const Query = {
  getAllThread: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      _.set(args, "q.filter.channel", ThreadChannel.customer);
      _.set(args, "q.filter.memberId", context.sellerId);
    } else {
      _.set(args, "q.filter.channel", ThreadChannel.member);
    }
    return threadService.fetch(args.q);
  },
  getOneThread: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    const query = { _id: id };
    if (context.isMember() || context.isStaff()) {
      _.set(query, "memberId", context.sellerId);
    }
    if (context.isCustomer()) {
      _.set(query, "customerId", context.id);
    }
    return await threadService.findOne({ _id: id });
  },
};

const Mutation = {
  createThread: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF_CUSTOMER);
    const { data } = args;
    const { channel, memberId, customerId } = data;

    let thread: IThread;

    if (context.isMember()) {
      console.log("is member");
      if (channel == ThreadChannel.member) {
        thread = await ThreadModel.findOneAndUpdate(
          { channel, memberId: context.id },
          { $set: { status: ThreadStatus.new } },
          { new: true, upsert: true }
        ).exec();
        console.log("member thread");
      } else {
        thread = await ThreadModel.findOneAndUpdate(
          { channel, memberId: context.id, customerId },
          { $set: { status: ThreadStatus.new } },
          { new: true, upsert: true }
        ).exec();
      }
    } else if (context.isCustomer()) {
      thread = await ThreadModel.findOneAndUpdate(
        { channel: ThreadChannel.customer, memberId, customerId: context.id },
        { $set: { status: ThreadStatus.new } },
        { new: true, upsert: true }
      ).exec();
    }

    return thread;
  },

  updateThread: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id, data } = args;

    if (context.isMember() || context.isStaff()) {
      await checkPermission(id, context);
    }
    return await threadService.updateOne(id, data);
  },
};

const Thread = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),
  user: GraphQLHelper.loadById(UserLoader, "userId"),
  message: GraphQLHelper.loadById(ThreadMessageLoader, "messageId"),
  threadLabels: GraphQLHelper.loadManyById(ThreadLabelLoader, "threadLabelIds"),
};

export default {
  Query,
  Mutation,
  Thread,
};

async function checkPermission(id: string, context: Context) {
  const thread: IThread = await notFoundHandler(await threadService.findOne({ _id: id }));
  if (thread.memberId.toString() !== context.sellerId.toString())
    throw ErrorHelper.permissionDeny();
}
