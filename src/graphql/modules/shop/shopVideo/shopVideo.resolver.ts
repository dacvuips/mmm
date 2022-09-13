import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { IShopVideo } from "./shopVideo.model";
import { shopVideoService } from "./shopVideo.service";

const Query = {
  getAllShopVideo: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF_CUSTOMER);
    // if context is customer, get only video of shop and active
    if (context.isCustomer() || context.isStaff()) {
      _.set(args, "q.filter.memberId", context.sellerId);
      _.set(args, "q.filter.active", true);
    }
    // if context is member, get only video of shop
    if (context.isMember()) {
      _.set(args, "q.filter.memberId", context.id);
    }
    return shopVideoService.fetch(args.q);
  },
  getOneShopVideo: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await shopVideoService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopVideo: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    // set memberId to data
    _.set(data, "memberId", context.sellerId);
    return await shopVideoService.create(data);
  },
  updateShopVideo: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    // check video is belongs to member
    await checkVideoBelongsToMember(id, context);
    return await shopVideoService.updateOne(id, data);
  },
  deleteOneShopVideo: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    await checkVideoBelongsToMember(id, context);
    return await shopVideoService.deleteOne(id);
  },
};

const ShopVideo = {};

export default {
  Query,
  Mutation,
  ShopVideo,
};
async function checkVideoBelongsToMember(id: any, context: Context) {
  const shopVideo: IShopVideo = await shopVideoService.findOne({ _id: id });
  if (shopVideo.memberId.toString() !== context.sellerId) {
    throw new Error("Không có quyền sửa video này");
  }
}
