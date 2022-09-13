import { set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { ProductLoader } from "../product/product.model";
import { ShopVoucherLoader } from "../shop/shopVoucher/shopVoucher.model";
import { bannerService } from "./banner.service";

const Query = {
  getAllBanner: async (root: any, args: any, context: Context) => {
    if (!context.isAdmin() && !context.isEditor()) {
      set(args, "q.filter.isPublic", true);
    }
    return bannerService.fetch(args.q);
  },
  getOneBanner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await bannerService.findOne({ _id: id });
  },
};

const Mutation = {
  createBanner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await bannerService.create(data);
  },
  updateBanner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await bannerService.updateOne(id, data);
  },
  deleteOneBanner: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await bannerService.deleteOne(id);
  },
};

const Banner = {
  shop: GraphQLHelper.loadById(MemberLoader, "memberId"),
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
  voucher: GraphQLHelper.loadById(ShopVoucherLoader, "voucherId"),
};

export default {
  Query,
  Mutation,
  Banner,
};
