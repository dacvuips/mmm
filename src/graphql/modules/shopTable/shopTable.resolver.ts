import _ from "lodash";
import { configs } from "../../../configs";
import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { BranchLoader } from "../branch/branch.model";
import { MemberLoader } from "../member/member.model";
import { ShopBranchLoader } from "../shop/shopBranch/shopBranch.model";
import { ShopTableHelper } from "./shopTable.helper";
import { ShopTableModel } from "./shopTable.model";
import { shopTableService } from "./shopTable.service";

const Query = {
  getAllShopTable: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (context.sellerId) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    //
    return shopTableService.fetch(args.q);
  },
  getOneShopTable: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await shopTableService.findOne({ _id: id });
  },
  getOneShopTableByCode: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_EDITOR_ADMIN);
    const { code } = args;
    return await shopTableService.findOne({ code, memberId: context.sellerId });
  },
};

const Mutation = {
  createShopTable: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    //check branchId
    const branch = await ShopBranchLoader.load(data.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }
    data.memberId = context.sellerId;
    data.code = data.code || (await ShopTableHelper.generateCode());
    //
    return await shopTableService.create(data);
  },
  updateShopTable: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    //check branchId
    const branch = await ShopBranchLoader.load(data.branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }
    // check shopTable, memberId and context.id
    const shopTable = await ShopTableModel.findOne({ _id: id });
    if (!shopTable) throw new Error("ShopTable not found");
    if (shopTable.memberId !== context.sellerId)
      throw new Error("ShopTable not belong to this member");
    //
    return await shopTableService.updateOne(id, data);
  },
  deleteOneShopTable: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    const shopTable = await ShopTableModel.findOne({ _id: id });
    if (!shopTable) throw new Error("ShopTable not found");
    if (shopTable.memberId !== context.sellerId)
      throw new Error("ShopTable not belong to this member");
    //
    return await shopTableService.deleteOne(id);
  },
};

const ShopTable = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  branch: GraphQLHelper.loadById(ShopBranchLoader, "branchId"),
  pickupUrl: async (root: any, args: any, context: Context) => {
    const domain = configs.domain;
    const member = await MemberLoader.load(root.memberId);
    return `${domain}/${member.code}?table=${root.code}`;
  },
};

export default {
  Query,
  Mutation,
  ShopTable,
};
