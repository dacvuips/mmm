import _ from "lodash";

import { ROLES } from "../../../../constants/role.const";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { CustomerLoader } from "../customer.model";
import { MemberLoader } from "../../member/member.model";
import { rewardPointLogService } from "./rewardPointLog.service";

const Query = {
  getAllRewardPointLog: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (context.sellerId) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    if (context.isCustomer()) {
      _.set(args, "q.filter.customerId", context.id);
    }
    return rewardPointLogService.fetch(args.q);
  },
  getOneRewardPointLog: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await rewardPointLogService.findOne({ _id: id });
  },
};

const RewardPointLog = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),
};

export default {
  Query,
  RewardPointLog,
};
