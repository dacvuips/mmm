import { gql } from "apollo-server-express";

import { configs } from "../../../configs";
import { ROLES } from "../../../constants/role.const";
import { ErrorHelper, firebaseHelper } from "../../../helpers";
import { TokenHelper } from "../../../helpers/token.helper";
import { Context } from "../../context";
import { accountService } from "../account/account.service";
import { UserHelper } from "./user.helper";
import { UserModel, UserRole } from "./user.model";

export default {
  schema: gql`
    extend type Mutation {
      login(idToken: String!, deviceId: String, deviceToken: String): LoginData
      updateUserPassword(id: ID!, password: String!): String
      loginUserByPassword(
        email: String!
        password: String!
        deviceId: String
        deviceToken: String
      ): LoginData
    }
    type LoginData {
      user: User
      token: String
    }
  `,
  resolver: {
    Mutation: {
      login: async (root: any, args: any, context: Context) => {
        const { idToken, deviceId, deviceToken } = args;
        let decode = await firebaseHelper.verifyIdToken(idToken);
        let user = await UserModel.findOne({ uid: decode.uid });
        if (!user) {
          if (decode.email == "admin@gmail.com") {
            user = await UserModel.create({
              uid: decode.uid,
              name: "Admin",
              email: decode.email,
              role: UserRole.ADMIN,
            });
          } else {
            throw ErrorHelper.userNotExist();
          }
        }
        if (deviceId && deviceToken) {
          await new UserHelper(user).setDevice(deviceId, deviceToken);
        }
        return {
          user,
          token: TokenHelper.generateToken({
            role: user.role,
            _id: user._id,
            username: user.name || user.email || user.phone || user.role,
          }),
        };
      },
      updateUserPassword: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);

        const { id, password } = args;

        const user = await UserModel.findById(id);
        if (!user) {
          throw ErrorHelper.mgRecoredNotFound("người dùng");
        }

        /** Validate password */
        if (password.length < 6) {
          throw ErrorHelper.updateUserError("mật khẩu phải có ít nhất 6 ký tự");
        }

        /** Update password */
        await accountService.updatePassword(user.uid, password);

        return `Mật khẩu của ${user.name} đã được cập nhật`;
      },
      loginUserByPassword: async (root: any, args: any, context: Context) => {
        const { email, password, deviceId, deviceToken } = args;

        if (email == configs.auth.admin.username) {
          const existAccount = await accountService.existsEmail(email);
          if (!existAccount) {
            /** Create First Admin account */
            await accountService.createAccountByEmailAndPassword(
              email,
              configs.auth.admin.password
            );
          }
        }

        const account = await accountService.loginByEmailAndPassword(email, password);
        let user = await UserModel.findOne({ uid: account.code });
        if (!user) {
          if (account.email == configs.auth.admin.username) {
            user = await UserModel.create({
              uid: account.code,
              name: "Admin",
              email: account.email,
              role: UserRole.ADMIN,
            });
          } else {
            throw ErrorHelper.userNotExist();
          }
        }
        if (deviceId && deviceToken) {
          await new UserHelper(user).setDevice(deviceId, deviceToken);
        }
        return {
          user,
          token: TokenHelper.generateToken({
            role: user.role,
            _id: user._id,
            username: user.name || user.email || user.phone || user.role,
          }),
        };
      },
    },
  },
};
