import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { MemberLoader } from "../../member/member.model";
import { shopContactService } from "./shopContact.service";

const Query = {
  getAllShopContact: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);
    _.set(args, "q.filter.memberId", context.sellerId);
    return shopContactService.fetch(args.q);
  },
  getOneShopContact: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER]);
    const { id } = args;
    return await shopContactService.findOne({ _id: id, memberId: context.sellerId });
  },
};

const Mutation = {
  createShopContact: async (root: any, args: any, context: Context) => {
    // context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    const { memberId } = data;
    if (!memberId) throw new Error("Sai Thông tin ID cửa hàng");
    if (!(await MemberLoader.load(memberId))) throw new Error("Sai thông tin ID cửa hàng");

    return await shopContactService.create(data);
  },
  // updateShopContact: async (root: any, args: any, context: Context) => {
  //   context.auth(ROLES.ADMIN_EDITOR);
  //   const { id, data } = args;
  //   return await shopContactService.updateOne(id, data);
  // },
  // deleteOneShopContact: async (root: any, args: any, context: Context) => {
  //   context.auth(ROLES.ADMIN_EDITOR);
  //   const { id } = args;
  //   return await shopContactService.deleteOne(id);
  // },
};

const ShopContact = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
};

export default {
  Query,
  Mutation,
  ShopContact,
};
