import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { EmailModel, EmailType } from "./email.model";
import { emailService } from "./email.service";

const Query = {
  getAllEmail: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return emailService.fetch(args.q);
  },
  getOneEmail: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await emailService.findOne({ _id: id });
  },
};

const Mutation = {
  createEmail: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    return await emailService.create(data);
  },
  updateEmail: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await emailService.updateOne(id, data);
  },
  deleteOneEmail: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    const email = await EmailModel.findById(id);
    if (email && email.type != EmailType.CUSTOM) throw Error("Không thể xoá loại email mặc định.");
    return await emailService.deleteOne(id);
  },
};

const Email = {};

export default {
  Query,
  Mutation,
  Email,
};
