import _ from "lodash";
import { configs } from "../../../../configs";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { CollaboratorLoader } from "../../collaborator/collaborator.model";
import { CustomerLoader } from "../../customer/customer.model";
import { MemberLoader, MemberModel } from "../../member/member.model";
import { ProductLoader, ProductModel } from "../../product/product.model";
import { shopSaleFeedService } from "./shopSaleFeed.service";
import { approvalStatus } from "../../../../constants/approveStatus";

const Query = {
  getAllShopSaleFeed: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    // set memberId to filter
    if (context.sellerId) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    if (!(context.isMember() || context.isAdmin() || context.isEditor())) {
      _.set(args, "q.filter.active", true);
    }
    return shopSaleFeedService.fetch(args.q);
  },
  getOneShopSaleFeed: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    let data = {
      _id: id,
    };
    if (!(context.isAdmin() || context.isEditor())) {
      _.set(data, "memberId", context.sellerId);
    }
    return await shopSaleFeedService.findOne(data);
  },
};

const Mutation = {
  createShopSaleFeed: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    // set memberId to data
    _.set(data, "memberId", context.sellerId);
    // if snippet is empty, then set snippet from some content of contents
    if (!data.snippet) {
      const content = _.get(data, "contents[0]");
      if (content) {
        _.set(data, "snippet", content.content);
      }
    }
    // if productId is not empty, then check productId belong to member
    await checkProductBelongToMember(data, context);

    return await shopSaleFeedService.create(data);
  },
  updateShopSaleFeed: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    // check sale feed belong to member
    await checkSaleFeedBelongToMember(id, context.sellerId);

    // if productId updated, then check productId belong to member
    await checkProductBelongToMember(data, context);
    _.set(data, "approvalStatus", approvalStatus.PENDING);
    return await shopSaleFeedService.updateOne(id, data);
  },
  deleteOneShopSaleFeed: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    // check sale feed belong to member
    await checkSaleFeedBelongToMember(id, context.sellerId);
    return await shopSaleFeedService.deleteOne(id);
  },
};

const ShopSaleFeed = {
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
  images: async (root: any, args: any, context: Context) => {
    // merge all images from contents, then remove duplicated, then return array
    const images = _.uniq(_.flatten(_.map(root.contents, "images")));
    return images;
  },
  shareLink: async (root: any, args: any, context: Context) => {
    if (!context.isCustomer()) return null;
    if (!root.productId) return null;
    const customer = await CustomerLoader.load(context.id);
    // if customer is collaborator, then return a share link with collaborator code
    if (customer.collaboratorId) {
      const collaborator = await CollaboratorLoader.load(customer.collaboratorId);
      if (collaborator) {
        const member = await MemberLoader.load(collaborator.memberId);
        const product = await ProductLoader.load(root.productId);
        if (member && product) {
          return `${configs.domain}/${member.code}/?product=${product.code}&colCode=${collaborator.shortCode}`;
        }
      }
    }
  },
};

export default {
  Query,
  Mutation,
  ShopSaleFeed,
};
async function checkProductBelongToMember(data: any, context: Context) {
  if (data.productId) {
    const product = await ProductModel.findOne({
      _id: data.productId,
      memberId: context.sellerId,
    });
    if (!product) {
      throw new Error("Product not found");
    }
  }
}

function checkSaleFeedBelongToMember(id: any, sellerId: string) {
  return shopSaleFeedService.findOne({ _id: id, memberId: sellerId }).then((saleFeed) => {
    if (!saleFeed) {
      throw new Error("Sale feed not belong to member");
    }
  });
}
