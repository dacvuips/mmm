import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { ITriggerGroup } from "./triggerGroup.model";
import { triggerGroupService } from "./triggerGroup.service";

const Query = {
  getAllTriggerGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    _.set(args, "q.filter.memberId", context.sellerId);
    return triggerGroupService.fetch(args.q);
  },
  getOneTriggerGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    return await triggerGroupService.findOne({ _id: id });
  },
};

const Mutation = {
  createTriggerGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.memberId = context.sellerId;
    return await triggerGroupService.create(data);
  },
  updateTriggerGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    // check trigger group is belong to seller
    await checkTriggerGroupBelongToMember(id, context);
    return await triggerGroupService.updateOne(id, data);
  },
  deleteOneTriggerGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    // check trigger group is belong to seller
    await checkTriggerGroupBelongToMember(id, context);
    return await triggerGroupService.deleteOne(id);
  },
};

const TriggerGroup = {};

export default {
  Query,
  Mutation,
  TriggerGroup,
};
async function checkTriggerGroupBelongToMember(id: any, context: Context) {
  const triggerGroup: ITriggerGroup = await triggerGroupService.findOne({ _id: id });
  if (triggerGroup.memberId.toString() !== context.sellerId) {
    throw new Error("Không có quyền sửa nhóm trigger này");
  }
}
