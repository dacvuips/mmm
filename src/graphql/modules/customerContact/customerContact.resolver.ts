import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { Context } from "../../context";
import { customerContactService } from "./customerContact.service";

const Query = {
  getAllCustomerContact: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return customerContactService.fetch(args.q);
  },
  getOneCustomerContact: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await customerContactService.findOne({ _id: id });
  },
};

const Mutation = {
  createCustomerContact: async (root: any, args: any, context: Context) => {
    const { data } = args;
    return await customerContactService.create(data);
  },
  deleteOneCustomerContact: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await customerContactService.deleteOne(id);
  },
};

const CustomerContact = {};

export default {
  Query,
  Mutation,
  CustomerContact,
};
