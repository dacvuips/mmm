import { set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { MemberModel } from "../member/member.model";
import { ProductLoader, ProductModel } from "../product/product.model";
import { CrossSaleModel } from "./crossSale.model";
import { crossSaleService } from "./crossSale.service";
import { getCrossSaleProduct } from "./lib/common";

const Query = {
  getAllCrossSale: async (root: any, args: any, context: Context) => {
    if (context.isCustomer()) {
      set(args, "q.filter.sellerId", context.sellerId);
      set(args, "q.filter.allowSale", true);
    } else if (context.memberCode) {
      const seller = await MemberModel.findOne({ code: context.memberCode });
      set(args, "q.filter.sellerId", seller._id);
      set(args, "q.filter.allowSale", true);
    } else {
      if (context.isMember() || context.isStaff()) {
        set(args, "q.filter.sellerId", context.sellerId);
      }
    }
    return crossSaleService.fetch(args.q);
  },
  getOneCrossSale: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await crossSaleService.findOne({ _id: id });
  },
};

const Mutation = {
  createCrossSale: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.MEMBER, ROLES.STAFF]);
    const { productId } = args;
    const product = await getCrossSaleProduct(productId);
    return await CrossSaleModel.findOneAndUpdate(
      { productId: product._id, sellerId: context.sellerId },
      { $set: { productName: product.name, allowSale: product.allowSale } },
      { new: true, upsert: true }
    ).exec();
  },
  deleteOneCrossSale: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await crossSaleService.deleteOne(id);
  },
};

const CrossSale = {
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
};

export default {
  Query,
  Mutation,
  CrossSale,
};
