import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { PostStatus } from "../../post/post.model";
import { ShopPostModel } from "./shopPost.model";
import { shopPostService } from "./shopPost.service";
import { shopPostViewLogService } from "./shopPostViewLog/shopPostViewLog.service";
import KhongDau from "khong-dau";

const Query = {
  getAllShopPost: async (root: any, args: any, context: Context) => {
    if (context.sellerId) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    if (!context.isMember()) {
      _.set(args, "q.filter.status", PostStatus.PUBLIC);
    }
    if (_.get(args, "q.filter.topicSlugs")) {
      const slugs: string[] = _.get(args, "q.filter.topicSlugs");
      const topicIds = await Promise.all(slugs.map((l) => shopPostService.getTopicIdBySlug(l)));
      delete args.q.filter.topicSlugs;
      _.set(args, "q.filter.topicIds", { $in: topicIds });
    }
    return shopPostService.fetch(args.q);
  },
  getOneShopPost: async (root: any, args: any, context: Context) => {
    const { id } = args;
    const post = await ShopPostModel.findOneAndUpdate(
      { _id: id },
      { $inc: { view: 1 } },
      { new: true }
    );
    shopPostViewLogService.emit("user_view", post, context);
    return post;
  },
};

const Mutation = {
  createShopPost: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    if (!data.slug) {
      data.slug = KhongDau(data.title).toLowerCase().trim().replace(/\ +/g, "-");
      if ((await ShopPostModel.count({ slug: data.slug })) > 0) {
        data.slug += "-" + _.random(1000, 9999);
      }
    }
    if (!data.priority) {
      data.priority = await ShopPostModel.find()
        .sort({ priority: -1 })
        .limit(1)
        .exec()
        .then((res) => {
          if (res.length == 0) return 0;
          return res[0].priority + 1;
        });
    }
    // set memberId to data
    data.memberId = context.sellerId;
    const post = await shopPostService.create(data);
    // await context.log(`Tạo bài đăng: ${post.title}`);
    return post;
  },
  updateShopPost: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    // check shop post belongs to member
    await checkShopPostBelongsToMember(id, context);
    const post = await shopPostService.updateOne(id, data);
    if (data.status == PostStatus.PUBLIC) {
      // await context.log(`Công khai bài đăng: ${post.title}`);
    }
    return post;
  },
  deleteOneShopPost: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    // check shop post belongs to member
    await checkShopPostBelongsToMember(id, context);
    return await shopPostService.deleteOne(id);
  },
};

const ShopPost = {};

export default {
  Query,
  Mutation,
  ShopPost,
};
function checkShopPostBelongsToMember(id: any, context: Context) {
  return ShopPostModel.findOne({ _id: id, memberId: context.sellerId }).then((post) => {
    if (!post) {
      throw new Error("Bài đăng không thuộc người dùng");
    }
  });
}
