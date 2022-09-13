import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { adminNotificationService } from "./adminNotification.service";

const Query = {
  getAllAdminNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return adminNotificationService.fetch(args.q);
  },
  getOneAdminNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await adminNotificationService.findOne({ _id: id });
  },
};

const Mutation = {
  createAdminNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    data.owner = await context.getOwner();
    return await adminNotificationService.create(data);
  },
  updateAdminNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await adminNotificationService.updateOne(id, data);
  },
  deleteOneAdminNotification: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await adminNotificationService.deleteOne(id);
  },
};

const AdminNotification = {};

export default {
  Query,
  Mutation,
  AdminNotification,
};
