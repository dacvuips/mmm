import { set } from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper, ErrorHelper } from "../../../../helpers";
import { notFoundHandler } from "../../../../helpers/functions/notFoundHandler";
import { Context } from "../../../context";
import { IThreadMessage } from "../threadMessage/threadMessage.model";
import { IThreadLabel } from "./threadLabel.model";
import { threadLabelService } from "./threadLabel.service";

const Query = {
  getAllThreadLabel: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return threadLabelService.fetch(args.q);
  },
  getOneThreadLabel: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await threadLabelService.findOne({ _id: id });
  },
};

const Mutation = {
  createThreadLabel: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { data } = args;
    if (context.isMember() || context.isStaff()) {
      data.memberId = context.sellerId;
    }
    return await threadLabelService.create(data);
  },
  updateThreadLabel: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id, data } = args;

    if (context.isMember() || context.isStaff()) {
      await checkPermission(id, context);
    }
    return await threadLabelService.updateOne(id, data);
  },
  deleteOneThreadLabel: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    if (context.isMember() || context.isStaff()) {
      await checkPermission(id, context);
    }
    return await threadLabelService.deleteOne(id);
  },
};

const ThreadLabel = {};

export default {
  Query,
  Mutation,
  ThreadLabel,
};

async function checkPermission(id: string, context: Context) {
  const threadLabel: IThreadLabel = await notFoundHandler(
    await threadLabelService.findOne({ _id: id })
  );
  if (!threadLabel.memberId && threadLabel.memberId.toString() !== context.sellerId.toString()) {
    throw ErrorHelper.permissionDeny();
  }
}
