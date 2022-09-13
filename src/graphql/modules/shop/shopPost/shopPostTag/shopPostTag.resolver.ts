import _ from "lodash";
import { ROLES } from "../../../../../constants/role.const";
import { AuthHelper } from "../../../../../helpers";
import { notFoundHandler } from "../../../../../helpers/functions/notFoundHandler";
import { Context } from "../../../../context";
import { IShopPostTag, ShopPostTagModel } from "./shopPostTag.model";
import { shopPostTagService } from "./shopPostTag.service";

const Query = {
  getAllShopPostTag: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    // set sellerId to filter
    _.set(args, "q.filter.memberId", context.sellerId);
    return shopPostTagService.fetch(args.q);
  },
  getOneShopPostTag: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopPostTagService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopPostTag: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    // set memberId to data
    _.set(data, "memberId", context.sellerId);

    return await shopPostTagService.create(data);
  },
  updateShopPostTag: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;

    // check shop post belongs to member
    await checkShopTagBelongsToMember(id, context);

    return await shopPostTagService.updateOne(id, data);
  },
  deleteOneShopPostTag: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;

    await checkShopTagBelongsToMember(id, context);

    return await shopPostTagService.deleteOne(id);
  },
};

const ShopPostTag = {};

export default {
  Query,
  Mutation,
  ShopPostTag,
};
async function checkShopTagBelongsToMember(id: any, context: Context) {
  const shopPostTag = notFoundHandler(await ShopPostTagModel.findById(id));
  if (shopPostTag.memberId.toString() !== context.sellerId) {
    throw new Error("Shop post tag not found");
  }
}
