import { gql } from "apollo-server-express";
import passwordHash from "password-hash";
import { configs } from "../../../configs";
import { SettingKey } from "../../../configs/settingData";

import { ROLES } from "../../../constants/role.const";
import { ErrorHelper, UtilsHelper, validateJSON } from "../../../helpers";
import cache from "../../../helpers/cache";
import { TokenHelper } from "../../../helpers/token.helper";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { DeviceInfoModel } from "../deviceInfo/deviceInfo.model";
import { MemberModel } from "../member/member.model";
import { SettingHelper } from "../setting/setting.helper";
import { StaffModel } from "./staff.model";

export default {
  schema: gql`
    extend type Mutation {
      loginStaff(
        memberCode: String!
        username: String!
        password: String!
        deviceId: String
        deviceToken: String
      ): LoginStaffData
      staffLogout(deviceId: String!): String
      updateStaffPassword(staffId: ID!, password: String!, oldPassword: String): Staff
      staffRequestResetPwd(memberCode: String!, username: String!): String
      staffResetPwd(token: String!, password: String!): String
    }
    type LoginStaffData {
      staff: Staff
      token: String
    }
  `,
  resolver: {
    Mutation: {
      loginStaff: async (root: any, args: any, context: Context) => {
        const { memberCode, username, password, deviceId, deviceToken } = args;
        logger.info("loginStaff", { args });
        const member = await MemberModel.findOne({ code: memberCode });
        if (!member) throw Error("Cửa hàng không đúng.");
        const staff = await StaffModel.findOne({ memberId: member._id, username: username });
        if (!staff) throw Error("Tên đăng nhập không tồn tại.");
        const passwordValid = passwordHash.verify(password, staff.password);
        if (!passwordValid) throw Error("Mật khẩu không đúng.");
        if (deviceId && deviceToken) {
          await DeviceInfoModel.remove({ $or: [{ deviceToken }, { deviceId }] });
          await DeviceInfoModel.create({ staffId: staff._id, deviceId, deviceToken });
        }
        return {
          staff: staff,
          token: TokenHelper.generateToken({
            role: ROLES.STAFF,
            _id: staff._id,
            username: staff.name || staff.username,
            memberId: staff.memberId,
            createdAt: new Date(),
          }),
        };
      },
      staffLogout: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.STAFF]);
        const { deviceId } = args;
        await DeviceInfoModel.remove({ staffId: context.id, deviceId }).exec();
        return "Đã đăng xuất";
      },
      updateStaffPassword: async (root: any, args: any, context: Context) => {
        let { staffId, password, oldPassword } = args;
        context.auth(ROLES.MEMBER_STAFF);

        if (password.length < 6) {
          throw ErrorHelper.updateUserError("mật khẩu phải có ít nhất 6 ký tự");
        }
        const staff = await StaffModel.findById(context.isStaff() ? context.id : staffId);
        if (!staff) throw Error("Không tìm thấy nhân viên.");
        if (staff.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();

        if (context.isStaff()) {
          validateJSON(args, { required: ["oldPassword"] });
          const verifyPassword = passwordHash.verify(oldPassword, staff.password);
          if (verifyPassword == false) {
            throw ErrorHelper.permissionDeny();
          }
        }

        staff.password = passwordHash.generate(password);
        return staff.save();
      },
      staffRequestResetPwd: async (root: any, args: any, context: Context) => {
        const { memberCode, username } = args;

        /** Validate member code */
        const member = await MemberModel.findOne({ code: memberCode });
        if (!member) throw Error("Cửa hàng không đúng.");

        /** Find staff account */
        const staff = await StaffModel.findOne({ memberId: member._id, username: username });
        if (!staff) throw Error("Tên đăng nhập không tồn tại.");

        if (staff.email) {
          /** Only Send Email if Staff has email */
          /** Get Account Setting */
          const [title, content, expiredSeconds] = await SettingHelper.loadMany([
            SettingKey.ACCOUNT_RESET_PWD_EMAIL_TITLE,
            SettingKey.ACCOUNT_RESET_PWD_EMAIL_CONTENT,
            SettingKey.ACCOUNT_RESET_PWD_EXPIRE_SECONDS,
          ]);

          /** Generate token */
          const token = `${memberCode}:` + Math.random().toString(36).substring(2);
          const key = `reset_pwd:${token}`;
          await cache.set(key, staff._id, expiredSeconds);

          /** Send reset pwd email */
          const ctx = {
            reset_pwd_url: `${configs.domain}/_auth/reset-staff-pwd?token=${token}`,
          };
          const html = UtilsHelper.parseStringWithInfo({ data: content, info: ctx });
          LocalBroker.emit("email.send", {
            from: "3MMarketing",
            to: staff.email,
            subject: title,
            html,
          });
        }

        return "Đã gửi email xác nhận";
      },
      staffResetPwd: async (root: any, args: any, context: Context) => {
        const { token, password } = args;
        const key = `reset_pwd:${token}`;
        const staffId = await cache.get(key);
        if (!staffId) throw Error("Token không hợp lệ.");

        const staff = await StaffModel.findById(staffId);
        if (!staff) throw Error("Token không hợp lệ");

        /** Change staff pwd */
        staff.password = passwordHash.generate(password);
        await staff.save();

        /** Clear token */
        await cache.del(key);

        return "Đổi mật khẩu thành công";
      },
    },
  },
};
