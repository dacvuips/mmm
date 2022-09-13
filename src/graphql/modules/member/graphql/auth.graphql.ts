import { gql } from "apollo-server-express";
import passwordHash from "password-hash";
import { configs } from "../../../../configs";
import { SettingKey } from "../../../../configs/settingData";

import { ROLES } from "../../../../constants/role.const";
import { ErrorHelper, firebaseHelper, UtilsHelper } from "../../../../helpers";
import cache from "../../../../helpers/cache";
import { TokenHelper } from "../../../../helpers/token.helper";
import LocalBroker from "../../../../services/broker";
import { Context } from "../../../context";
import { DeviceInfoModel } from "../../deviceInfo/deviceInfo.model";
import { SettingHelper } from "../../setting/setting.helper";
import { MemberHelper } from "../member.helper";
import { MemberModel } from "../member.model";

export default {
  schema: gql`
    extend type Mutation {
      "Đăng nhập chủ shop bằng firebase token"
      loginMember(idToken: String!): MemberLoginData
      "Đăng nhập chủ shop bằng email và password"
      loginMemberByPassword(
        username: String!
        password: String!
        deviceId: String
        deviceToken: String
      ): MemberLoginData
      "Cập nhật mật khẩu chủ shop"
      updateMemberPassword(memberId: ID!, password: String!): Member
      "Chủ shop yêu cầu reset mật khẩu"
      memberRequestResetPwd(email: String!): String
      "Chủ shop reset mật khẩu"
      memberResetPwd(token: String!, password: String!): String
      "Kiểm tra token reset mật khẩu"
      validateResetPwdToken(token: String!): String
    }
  `,
  resolver: {
    Mutation: {
      loginMember: async (root: any, args: any, context: Context) => {
        const { idToken } = args;
        let decode = await firebaseHelper.verifyIdToken(idToken);
        let member = await MemberModel.findOne({ uid: decode.uid });
        if (!member && decode.email) {
          member = await MemberModel.findOneAndUpdate(
            { username: decode.email },
            { $set: { uid: decode.uid } },
            { new: true }
          );
        }
        if (!member) throw ErrorHelper.mgRecoredNotFound("Tài khoản");
        const helper = new MemberHelper(member);

        const token = helper.getToken();

        await MemberModel.findByIdAndUpdate(
          member.id,
          {
            $set: {
              lastLoginDate: new Date(),
            },
          },
          { new: true }
        );

        return { member: member, token };
      },
      updateMemberPassword: async (root: any, args: any, context: Context) => {
        let { memberId, password } = args;
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        if (context.isMember() || context.isStaff()) memberId = context.sellerId;
        if (password.length < 6) {
          throw ErrorHelper.updateUserError("mật khẩu phải có ít nhất 6 ký tự");
        }
        const member = await MemberModel.findById(memberId);
        if (!member) {
          throw ErrorHelper.mgRecoredNotFound("người dùng");
        }
        try {
          member.password = passwordHash.generate(password);
          return member.save();
          // return firebaseHelper.updateUser(member.uid, { password }).then((res) => member);
        } catch (error) {
          throw ErrorHelper.updateUserError(error);
        }
      },
      loginMemberByPassword: async (root: any, args: any, context: Context) => {
        const { username, password, deviceId, deviceToken } = args;
        const member = await MemberModel.findOne({ username: username });
        if (!member) throw Error("Tên đăng nhập không tồn tại.");
        const passwordValid = passwordHash.verify(password, member.password);
        if (!passwordValid) throw Error("Mật khẩu không đúng.");
        if (deviceId && deviceToken) {
          await DeviceInfoModel.remove({ $or: [{ deviceToken }, { deviceId }] });
          await DeviceInfoModel.create({ memberId: member._id, deviceId, deviceToken });
        }
        return {
          member: member,
          token: TokenHelper.generateToken({
            role: ROLES.MEMBER,
            _id: member._id,
            username: member.username,
            createdAt: new Date(),
          }),
        };
      },
      memberRequestResetPwd: async (root: any, args: any, context: Context) => {
        const { email } = args;

        /** Find member by email */
        const member = await MemberModel.findOne({ username: email });
        if (!member) throw Error("Tài khoản không tồn tại");

        /** Get Reset Account Config */
        const [title, content, expireSeconds] = await SettingHelper.loadMany([
          SettingKey.ACCOUNT_RESET_PWD_EMAIL_TITLE,
          SettingKey.ACCOUNT_RESET_PWD_EMAIL_CONTENT,
          SettingKey.ACCOUNT_RESET_PWD_EXPIRE_SECONDS,
        ]);

        /** Create random reset pwd token */
        const token =
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const key = `reset_pwd:${token}`;
        await cache.set(key, member._id, expireSeconds);

        /** Send reset pwd email */
        const ctx = {
          reset_pwd_url: `${configs.domain}/_auth/reset-member-pwd?token=${token}`,
        };
        const html = UtilsHelper.parseStringWithInfo({ data: content, info: ctx });
        LocalBroker.emit("email.send", { from: "3MMarketing", to: email, subject: title, html });

        return "Đã gửi email xác nhận";
      },
      memberResetPwd: async (root: any, args: any, context: Context) => {
        const { token, password } = args;
        /** Validate token */
        const memberId = await cache.get(`reset_pwd:${token}`);
        if (!memberId) throw Error("Token không hợp lệ");
        /** Validate member acccount */
        const member = await MemberModel.findById(memberId);
        if (!member) throw Error("Tài khoản không tồn tại");

        /** Reset member password */
        member.password = passwordHash.generate(password);
        await member.save();

        /** Clear token */
        await cache.del(`reset_pwd:${token}`);

        return "Đã cập nhật mật khẩu";
      },
      validateResetPwdToken: async (root: any, args: any, context: Context) => {
        const { token } = args;
        const key = `reset_pwd:${token}`;
        const exists = await cache.exists(key);
        if (!exists) throw Error("Token không hợp lệ");
        return "Token hợp lệ";
      },
    },
  },
};
