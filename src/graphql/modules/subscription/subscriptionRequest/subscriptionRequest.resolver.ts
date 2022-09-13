import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../context";
import { subscriptionRequestService } from "./subscriptionRequest.service";
import { createSubscriptionRequestProcess } from "./createSubscriptionRequest";

const Query = {
  getAllSubscriptionRequest: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember()) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    return subscriptionRequestService.fetch(args.q);
  },
  getOneSubscriptionRequest: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await subscriptionRequestService.findOne({ _id: id });
  },
};

const Mutation = {
  createSubscriptionRequest: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const {
      data: { plan, months, days },
    } = args;
    const ctx = {
      input: {
        plan: plan,
        months: months,
        memberId: context.sellerId,
        days: days,
      },
    };

    return await createSubscriptionRequestProcess(ctx);
  },
};

const SubscriptionRequest = {};

export default {
  Query,
  Mutation,
  SubscriptionRequest,
};
