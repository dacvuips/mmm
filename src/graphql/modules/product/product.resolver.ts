import _, { set } from "lodash";

import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { CategoryLoader, CategoryModel } from "../category/category.model";
import { CollaboratorLoader, CollaboratorModel } from "../collaborator/collaborator.model";
import { CollaboratorProductModel } from "../collaboratorProduct/collaboratorProduct.model";
import { CrossSaleModel } from "../crossSale/crossSale.model";
import { MemberLoader } from "../member/member.model";
import { OrderItemModel } from "../orderItem/orderItem.model";
import { ProductLabelLoader } from "../productLabel/productLabel.model";
import { ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { ShopVoucherModel } from "../shop/shopVoucher/shopVoucher.model";
import { ProductHelper } from "./product.helper";
import { IProduct, ProductLoader, ProductModel, ProductType } from "./product.model";
import { productService } from "./product.service";

const Query = {
  getAllProduct: async (root: any, args: any, context: Context) => {
    // context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_EDITOR_ADMIN);
    if (context.sellerId) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    if (context.isAnonymous() || context.isCustomer() || context.isAuth == false) {
      set(args, "q.filter.allowSale", true);
    }
    set(args, "q.filter.deletedAt", { $exists: false });
    return await productService.fetch(args.q);
  },

  getOneProduct: async (root: any, args: any, context: Context) => {
    // AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_CUSTOMER);
    const { id } = args;
    return await productService.findOne({ _id: id });
  },
};

const Mutation = {
  createProduct: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.MEMBER, ROLES.STAFF]);
    let data: IProduct = args.data;
    data.isCrossSale = false;
    data.isPrimary = false;
    data.memberId = context.sellerId;
    data.code = data.code || (await ProductHelper.generateCode());
    data.type = ProductType.RETAIL;
    const product = await ProductModel.create(data);
    await CategoryModel.updateOne(
      { _id: product.categoryId },
      { $addToSet: { productIds: product._id } }
    );
    return product;
  },

  updateProduct: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    const product = await protectDoc(id, context);
    const res = (await productService.updateOne(id, data)) as IProduct;
    ProductLoader.clear(res.id);
    await CrossSaleModel.updateMany(
      { productId: res._id },
      { $set: { productName: res.name, allowSale: res.allowSale } }
    );
    if (res.categoryId.toString() != product.categoryId.toString()) {
      await CategoryModel.updateOne(
        { _id: product.categoryId },
        { $pull: { productIds: product._id } }
      );
      await CategoryModel.updateOne(
        { _id: res.categoryId },
        { $addToSet: { productIds: product._id } }
      );
    }
    return res;
  },

  deleteOneProduct: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    const product = await protectDoc(id, context);
    const orderItemCount = await OrderItemModel.count({ productId: id });

    if (orderItemCount > 0) {
      product.deletedAt = new Date();
      await product.save();
    } else {
      await productService.deleteOne(id);
    }
    await CrossSaleModel.remove({ productId: product._id }).exec();
    await CategoryModel.updateOne(
      { _id: product.categoryId },
      { $pull: { productIds: product._id } }
    );
    await ProductModel.updateMany({ upsaleProductIds: id }, { $pull: { upsaleProductIds: id } });
    await ShopConfigModel.updateMany(
      { memberId: context.sellerId, "productGroups.productIds": product._id },
      { $pullAll: { "productGroups.$.productIds": [product._id] } }
    );
    await ShopVoucherModel.updateMany(
      { "offerItems.productId": product._id },
      {
        $set: { isActive: false },
        $pull: { offerItems: { productId: product._id } },
      }
    );
    await ShopVoucherModel.updateMany(
      { "offerItemGroups.offerItems.productId": product._id },
      {
        $set: { isActive: false },
        $pull: { offerItemGroups: { offerItems: { productId: product._id } } as any },
      }
    );
    return product;
  },
};

const Product = {
  category: GraphQLHelper.loadById(CategoryLoader, "categoryId"),
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  crossSaleOrdered: GraphQLHelper.requireRoles(ROLES.ADMIN_EDITOR_MEMBER),
  labels: GraphQLHelper.loadManyById(ProductLabelLoader, "labelIds"),
  upsaleProducts: GraphQLHelper.loadManyById(ProductLoader, "upsaleProductIds", { skipNull: true }),
  collaboratorProduct: async (root: IProduct, args: any, context: Context) => {
    let collaProduct = null;
    if (context.isCustomer()) {
      const collaborator = await CollaboratorModel.findOne({
        customerId: context.id,
      });
      if (collaborator) {
        collaProduct = await CollaboratorProductModel.findOne({
          productId: root.id,
          collaboratorId: collaborator.id,
        });
      }
    }
    return collaProduct;
  },
};

const resolveArgs = (data: any) => {
  delete data.isPrimary;
};

export default {
  Query,
  Mutation,
  Product,
};
async function protectDoc(id: any, context: Context) {
  const product = await ProductModel.findById(id);
  if (product.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
  return product;
}
