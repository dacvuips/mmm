import { set } from "lodash";

import { ErrorHelper } from "../../../../base/error";
import { ROLES } from "../../../../constants/role.const";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { MemberLoader } from "../../member/member.model";
import { ProductLoader } from "../../product/product.model";
import { ShopVoucherModel } from "./shopVoucher.model";
import { shopVoucherService } from "./shopVoucher.service";

const Query = {
  getAllShopVoucher: async (root: any, args: any, context: Context) => {
    context.auth([...ROLES.ANONYMOUS_CUSTOMER_MEMBER_EDITOR_ADMIN, ROLES.STAFF]);
    if (context.sellerId) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    if (!(context.isMember() || context.isAdmin() || context.isEditor())) {
      set(args, "q.filter.isActive", true);
      set(args, "q.filter.isPrivate", false);
      set(args, "q.filter.isPersonal", false);
      set(args, "q.filter.startDate", { $not: { $gt: new Date() } });
      set(args, "q.filter.endDate", { $not: { $lte: new Date() } });
    }
    return shopVoucherService.fetch(args.q);
  },
  getOneShopVoucher: async (root: any, args: any, context: Context) => {
    context.auth([...ROLES.ANONYMOUS_CUSTOMER_MEMBER_EDITOR_ADMIN, ROLES.STAFF]);
    const { id } = args;
    return await shopVoucherService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopVoucher: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.memberId = context.sellerId;
    return await shopVoucherService.create(data);
  },
  updateShopVoucher: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    await protectDoc(id, context);
    return await shopVoucherService.updateOne(id, data);
  },
  deleteOneShopVoucher: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    await protectDoc(id, context);
    return await shopVoucherService.deleteOne(id);
  },
};

const ShopVoucher = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
};

const DiscountItem = {
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
};

const OfferItem = {
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
};

export default {
  Query,
  Mutation,
  ShopVoucher,
  DiscountItem,
  OfferItem,
};
async function protectDoc(id: any, context: Context) {
  const doc = await ShopVoucherModel.findById(id);
  if (doc.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
}
