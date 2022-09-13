import { ROLES } from "../../../constants/role.const";
import { onActivity } from "../../../events/onActivity.event";
import { AuthHelper, ErrorHelper, UtilsHelper } from "../../../helpers";
import { logger } from "../../../loaders/logger";
import { Context } from "../../context";
import { accountService } from "../account/account.service";
import { UserHelper } from "./user.helper";
import { IUser, UserModel, UserRole } from "./user.model";
import { userService } from "./user.service";

const Query = {
  getAllUser: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.ADMIN, ROLES.EDITOR]);
    return userService.fetch(args.q);
  },
  getOneUser: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.ADMIN, ROLES.EDITOR]);
    const { id } = args;
    return await userService.findOne({ _id: id });
  },
};

const Mutation = {
  createUser: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.ADMIN]);
    const { data } = args;

    /** validate email */
    if (!UtilsHelper.isEmail(data.email))
      throw ErrorHelper.createUserError("email không đúng định dạng");
    /** validate passowrd */
    if (data.password.length < 6)
      throw ErrorHelper.createUserError("mật khẩu phải có ít nhất 6 ký tự");

    /** Check User is Exist */
    const user = await UserModel.findOne({ email: data.email });
    if (user) {
      throw ErrorHelper.createUserError("email này đã có tài khoản");
    }

    /** Set data role */
    data.role = data.role || UserRole.EDITOR;

    /** Create Account For User */
    const password = data.password;
    delete data.password;

    const account = await accountService.createAccountByEmailAndPassword(data.email, password);
    data.uid = account.code;

    const userHelper = new UserHelper(new UserModel(data));

    await Promise.all([
      userHelper.setProvinceName(),
      userHelper.setDistrictName(),
      userHelper.setWardName(),
    ]);

    return await userHelper
      .value()
      .save()
      .then((res) => {
        onActivity.next({
          username: context.tokenData.username || "",
          message: `Tạo người dùng`,
        });
        return res;
      });
  },
  updateUser: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    if (context.tokenData.role != ROLES.ADMIN) AuthHelper.isOwner(context, id);
    return await userService.updateOne(id, data).then(async (res: IUser) => {
      onActivity.next({
        username: context.tokenData.username || "",
        message: `Cập nhật người dùng`,
      });
      const userHelper = new UserHelper(res);
      await Promise.all([
        userHelper.setProvinceName(),
        userHelper.setDistrictName(),
        userHelper.setWardName(),
      ]);
      return await userHelper.value().save();
    });
  },
  deleteOneUser: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.ADMIN]);
    const { id } = args;
    const user = (await userService.deleteOne(id)) as IUser;

    onActivity.next({
      username: context.tokenData.username || "",
      message: `Xóa người dùng`,
    });

    /** Delete account */
    logger.info("delete account::::" + user.uid);
    await accountService.deleteByCode(user.uid).catch((err) => {
      logger.error("delete account error::::" + err.message);
    });

    return user;
  },
};

const User = {
  unseenNotify: async (root: IUser, args: any, context: Context) => {
    return await new UserHelper(root).getUnseenNotify();
  },
  subscriber: async (root: IUser, args: any, context: Context) => {
    return await new UserHelper(root).getSubscriber();
  },
};

export default {
  Query,
  Mutation,
  User,
};
