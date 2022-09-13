import { ROLES } from "../../../../../constants/role.const";
import { AuthHelper } from "../../../../../helpers";
import { Context } from "../../../../context";
import { shopTopicService } from "./shopTopic.service";
import KhongDau from "khong-dau";
import { ShopTopicModel } from "./shopTopic.model";
import { random } from "lodash";
import _ from "lodash";

const Query = {
  getAllShopTopic: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    // set sellerId to filter
    _.set(args, "q.filter.memberId", context.sellerId);
    return shopTopicService.fetch(args.q);
  },
  getOneShopTopic: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    const { id } = args;
    return await shopTopicService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopTopic: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    // set memberId to data
    _.set(data, "memberId", context.sellerId);
    if (!data.slug) {
      data.slug = KhongDau(data.title).toLowerCase().trim().replace(/\ +/g, "-");
    }
    if ((await ShopTopicModel.count({ slug: data.slug })) > 0) {
      data.slug += "-" + random(1000, 9999);
    }
    return await shopTopicService.create(data);
  },
  updateShopTopic: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    // check shop topic belongs to member
    await checkShopTopicBelongsToMember(id, context);
    return await shopTopicService.updateOne(id, data);
  },
  deleteOneShopTopic: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    // check shop topic belongs to member
    await checkShopTopicBelongsToMember(id, context);
    return await shopTopicService.deleteOne(id);
  },
};

const ShopTopic = {};

export default {
  Query,
  Mutation,
  ShopTopic,
};

function checkShopTopicBelongsToMember(id: string, context: Context) {
  return ShopTopicModel.findById(id).then((shopTopic) => {
    if (shopTopic.memberId.toString() !== context.sellerId) {
      throw new Error("Shop topic not found");
    }
  });
}
