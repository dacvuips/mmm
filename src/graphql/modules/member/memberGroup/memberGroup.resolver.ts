import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { memberGroupService } from "./memberGroup.service";

const Query = {
  getAllMemberGroup: async (root: any, args: any, context: Context) => {
    return memberGroupService.fetch(args.q);
  },
  getOneMemberGroup: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await memberGroupService.findOne({ _id: id });
  },
};

const Mutation = {
  createMemberGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await memberGroupService.create(data);
  },
  updateMemberGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await memberGroupService.updateOne(id, data);
  },
  deleteOneMemberGroup: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await memberGroupService.deleteOne(id);
  },
};

const MemberGroup = {};

export default {
  Query,
  Mutation,
  MemberGroup,
};
