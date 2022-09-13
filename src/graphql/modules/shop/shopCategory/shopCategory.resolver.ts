import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { shopCategoryService } from "./shopCategory.service";

const Query = {
  getAllShopCategory: async (root: any, args: any, context: Context) => {
    return shopCategoryService.fetch(args.q);
  },
  getOneShopCategory: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopCategoryService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await shopCategoryService.create(data);
  },
  updateShopCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await shopCategoryService.updateOne(id, data);
  },
  deleteOneShopCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await shopCategoryService.deleteOne(id);
  },
};

const ShopCategory = {};

export default {
  Query,
  Mutation,
  ShopCategory,
};
