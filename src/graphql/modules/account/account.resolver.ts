import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { Context } from "../../context";
import { accountService } from "./account.service";

const Query = {
  getAllAccount: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return accountService.fetch(args.q);
  },
  getOneAccount: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await accountService.findOne({ _id: id });
  },
};

const Mutation = {
  createAccount: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await accountService.create(data);
  },
  deleteOneAccount: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await accountService.deleteOne(id);
  },
};

const Account = {
  
};

export default {
  Query,
  Mutation,
  Account,
};
