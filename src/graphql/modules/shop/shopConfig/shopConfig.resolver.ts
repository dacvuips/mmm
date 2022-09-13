import { ROLES } from "../../../../constants/role.const";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { ShopConfigModel } from "./shopConfig.model";
import $ from "mongo-dot-notation";
import LocalBroker from "../../../../services/broker";

const Mutation = {
  updateShopConfig: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    const config = await ShopConfigModel.findOneAndUpdate({ _id: id }, $.flatten(data), {
      new: true,
    }).exec();

    LocalBroker.call("shopConfig.clear", { id: config.memberId.toString() });
    return config;
  },
};

const ShopConfig = {
  colCommissionBy: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF]),
  colCommissionUnit: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF]),
  colCommissionValue: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF]),

  cassoUser: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], null),
};

export default {
  Mutation,
  ShopConfig,
};
