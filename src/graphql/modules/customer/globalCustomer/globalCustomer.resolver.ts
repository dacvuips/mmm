import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { globalCustomerService } from "./globalCustomer.service";

const Query = {
  getAllGlobalCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    return globalCustomerService.fetch(args.q);
  },
  getOneGlobalCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await globalCustomerService.findOne({ _id: id });
  },
};

const Mutation = {
  createGlobalCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { data } = args;
    return await globalCustomerService.create(data);
  },
  updateGlobalCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id, data } = args;
    return await globalCustomerService.updateOne(id, data);
  },
  deleteOneGlobalCustomer: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await globalCustomerService.deleteOne(id);
  },
};

const GlobalCustomer = {};

export default {
  Query,
  Mutation,
  GlobalCustomer,
};
