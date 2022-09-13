import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { CustomerLoader } from "../../customer/customer.model";
import { MemberLoader } from "../../member/member.model";
import { disburseItemService } from "./disburseItem.service";

const Query = {
  getAllDisburseItem: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    return disburseItemService.fetch(args.q);
  },
  getOneDisburseItem: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await disburseItemService.findOne({ _id: id });
  },
};

const Mutation = {
  createDisburseItem: async (root: any, args: any, context: Context) => {
    context.auth([]);
    const { data } = args;
    return await disburseItemService.create(data);
  },
  deleteOneDisburseItem: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await disburseItemService.deleteOne(id);
  },
};

const DisburseItem = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),
};

export default {
  Query,
  Mutation,
  DisburseItem,
};
