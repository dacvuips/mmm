import { ROLES } from "../../../../../constants/role.const";
import { AuthHelper } from "../../../../../helpers";
import { Context } from "../../../../context";
import { shopSaleFeedGroupService } from "./shopSaleFeedGroup.service";

const Query = {
  getAllShopSaleFeedGroup: async (root: any, args: any, context: Context) => {
    return shopSaleFeedGroupService.fetch(args.q);
  },
  getOneShopSaleFeedGroup: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopSaleFeedGroupService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopSaleFeedGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { data } = args;
    return await shopSaleFeedGroupService.create(data);
  },
  updateShopSaleFeedGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id, data } = args;
    return await shopSaleFeedGroupService.updateOne(id, data);
  },
  deleteOneShopSaleFeedGroup: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.ADMIN]);
    const { id } = args;
    return await shopSaleFeedGroupService.deleteOne(id);
  },
};

const ShopSaleFeedGroup = {};

export default {
  Query,
  Mutation,
  ShopSaleFeedGroup,
};
