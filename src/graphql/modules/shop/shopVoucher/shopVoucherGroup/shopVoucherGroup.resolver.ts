import { ROLES } from "../../../../../constants/role.const";
import { AuthHelper } from "../../../../../helpers";
import { Context } from "../../../../context";
import { shopVoucherGroupService } from "./shopVoucherGroup.service";

const Query = {
  getAllShopVoucherGroup: async (root: any, args: any, context: Context) => {
    return shopVoucherGroupService.fetch(args.q);
  },
  getOneShopVoucherGroup: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopVoucherGroupService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopVoucherGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await shopVoucherGroupService.create(data);
  },
  updateShopVoucherGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await shopVoucherGroupService.updateOne(id, data);
  },
  deleteOneShopVoucherGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await shopVoucherGroupService.deleteOne(id);
  },
};

const ShopVoucherGroup = {};

export default {
  Query,
  Mutation,
  ShopVoucherGroup,
};
