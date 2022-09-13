import { set } from "lodash";
import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { ProductLoader } from "../product/product.model";
import { CategoryHelper } from "./category.helper";
import { CategoryModel } from "./category.model";
import { categoryService } from "./category.service";

const Query = {
  getAllCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    set(args, "q.filter.memberId", context.sellerId);
    if (!context.isMember()) {
      set(args, "q.filter.hidden", { $ne: true });
    }
    return categoryService.fetch(args.q);
  },
  getOneCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    const { id } = args;
    return await categoryService.findOne({ _id: id });
  },
  getFilteringCategories: async (root: any, args: any, context: Context) => {
    return await CategoryModel.find({ isPrimary: true });
  },
};

const Mutation = {
  createCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF);
    const { data } = args;
    data.memberId = context.sellerId;
    data.code = data.code || (await CategoryHelper.generateCode());
    return await categoryService.create(data);
  },
  updateCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF);
    const { id, data } = args;
    await protectDoc(id, context);
    return await categoryService.updateOne(id, data);
  },
  deleteOneCategory: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF);
    const { id } = args;
    const category = await protectDoc(id, context);
    if (category.productIds.length > 0) throw Error("Không thể xoá khi còn sản phẩm");
    return await categoryService.deleteOne(id);
  },
};

const Category = {
  products: GraphQLHelper.loadManyById(ProductLoader, "productIds", { skipNull: true }),
};

export default {
  Query,
  Mutation,
  Category,
};
async function protectDoc(id: any, context: Context) {
  const category = await CategoryModel.findById(id);
  if (category.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
  return category;
}
