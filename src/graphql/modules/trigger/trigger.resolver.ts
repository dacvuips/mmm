import _ from "lodash";

import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { counterService } from "../counter/counter.service";
import { TriggerModel } from "./trigger.model";
import { triggerService } from "./trigger.service";
import { TriggerGroupLoader } from "./triggerGroup/triggerGroup.model";

const Query = {
  getAllTrigger: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    _.set(args, "q.filter.memberId", context.sellerId);
    return triggerService.fetch(args.q);
  },
  getOneTrigger: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    return await triggerService.findOne({ _id: id });
  },
};

const Mutation = {
  createTrigger: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.memberId = context.sellerId;
    if (!data.code) {
      data.code = await counterService.trigger("trigger").then((res) => "TG" + res);
    }
    return await triggerService.create(data);
  },
  updateTrigger: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    const trigger = await TriggerModel.findById(id);
    if (trigger?.memberId?.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    return await triggerService.updateOne(id, data);
  },
  deleteOneTrigger: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    const trigger = await TriggerModel.findById(id);
    if (trigger?.memberId?.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    return await triggerService.deleteOne(id);
  },
};

const Trigger = {
  triggerGroup: GraphQLHelper.loadById(TriggerGroupLoader, "triggerGroupId"),
};

export default {
  Query,
  Mutation,
  Trigger,
};
