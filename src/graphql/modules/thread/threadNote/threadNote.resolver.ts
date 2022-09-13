import _ from "lodash";
import { ErrorHelper } from "../../../../base/error";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { ThreadModel } from "../thread.model";
import { threadNoteService } from "./threadNote.service";

const Query = {
  getAllThreadNote: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const threadId = _.get(args, "q.filter.threadId");
    if (_.isEmpty(threadId)) throw Error("Filter ThreadID is required");
    if (context.isMember() || context.isStaff()) {
      const thread = await ThreadModel.findById(threadId);
      if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return threadNoteService.fetch(args.q);
  },
  getOneThreadNote: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await threadNoteService.findOne({ _id: id });
  },
};

const Mutation = {
  createThreadNote: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { data } = args;
    if (context.isMember() || context.isStaff()) {
      const thread = await ThreadModel.findById(data.threadId);
      if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return await threadNoteService.create(data);
  },
  updateThreadNote: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id, data } = args;
    if (context.isMember() || context.isStaff()) {
      const thread = await ThreadModel.findById(id);
      if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return await threadNoteService.updateOne(id, data);
  },
  deleteOneThreadNote: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    if (context.isMember() || context.isStaff()) {
      const thread = await ThreadModel.findById(id);
      if (thread.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return await threadNoteService.deleteOne(id);
  },
};

const ThreadNote = {};

export default {
  Query,
  Mutation,
  ThreadNote,
};
