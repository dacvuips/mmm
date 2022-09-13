import _ from "lodash";
import { ROLES } from "../../../../../constants/role.const";
import { AuthHelper } from "../../../../../helpers";
import { Context } from "../../../../context";
import { shopPostViewLogService } from "./shopPostViewLog.service";

const Query = {
  getAllShopPostViewLog: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    // set sellerId to filter
    _.set(args, "q.filter.memberId", context.sellerId);
    return shopPostViewLogService.fetch(args.q);
  },
  getOneShopPostViewLog: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    return await shopPostViewLogService.findOne({ _id: id, memberId: context.sellerId });
  },
};

const ShopPostViewLog = {};

export default {
  Query,
  ShopPostViewLog,
};
