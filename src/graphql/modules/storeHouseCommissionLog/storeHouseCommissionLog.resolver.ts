import { set } from "lodash";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { Context } from "../../context";
import { MemberHelper } from "../member/member.helper";
import { OrderLoader, ShipMethod } from "../order/order.model";
import { storeHouseCommissionLogService } from "./storeHouseCommissionLog.service";
import { IStoreHouseCommissionLog } from "./storeHouseCommissionLog.model";
import { MemberLoader } from "../member/member.model";

const Query = {
  getAllStoreHouseCommissionLog: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const memberHelper = await MemberHelper.fromContext(context);
    if (memberHelper) {
      set(args, "q.filter.memberId", memberHelper.member._id);
    }
    return storeHouseCommissionLogService.fetch(args.q);
  },
  getOneStoreHouseCommissionLog: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.ADMIN, ROLES.EDITOR]);
    const { id } = args;
    return await storeHouseCommissionLogService.findOne({ _id: id });
  },
};

const Mutation = {
  getTest: async (root: any, args: any, context: Context) => {
    return "";
  },
};

const StoreHouseCommissionLog = {
  order: GraphQLHelper.loadById(OrderLoader, "orderId"),
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  note: async (root: IStoreHouseCommissionLog, args: any, context: Context) => {
    return "";
  },
};

export default {
  Query,
  Mutation,
  StoreHouseCommissionLog,
};
