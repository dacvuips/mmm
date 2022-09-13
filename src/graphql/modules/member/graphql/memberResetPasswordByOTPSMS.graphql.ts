import { gql } from "apollo-server-express";
import _ from "lodash";
import passwordHash from "password-hash";
import { SettingKey } from "../../../../configs/settingData";
import { ROLES } from "../../../../constants/role.const";
import { ErrorHelper, UtilsHelper } from "../../../../helpers";
import cache from "../../../../helpers/cache";
import esms from "../../../../helpers/esms";
import { notFoundHandler } from "../../../../helpers/functions/notFoundHandler";
import { TokenHelper } from "../../../../helpers/token.helper";
import { Context } from "../../../context";
import { SettingHelper } from "../../setting/setting.helper";
import { MemberModel } from "../member.model";

export default {
  schema: gql`
    extend type Mutation {
      memberResetPasswordOTPSMSRequest(code: String!, username: String!): Mixed
      memberResetPasswordGetToken(code: String!, OTP: String!): Mixed
      memberResetPasswordByToken(code: String!, newPassword: String!): Mixed
    }
  `,
  resolver: {
    Mutation: {
      memberResetPasswordOTPSMSRequest: async (root: any, args: any, context: Context) => {
        const { code, username } = args;
        const member = await notFoundHandler(await MemberModel.findOne({ code, username }));
        let OTP = await cache.get(`member:OTP:${member._id}`);

        if (OTP) {
          return "Tin nhắn đã được gửi đi";
        }
        // generate OTP code
        OTP = _.random(100000, 999999).toString();
        // save OTP code to redis cache, and cache 5 minutes
        cache.set(`member:OTP:${member._id}`, OTP, 60 * 5);

        const [smsTemplate] = await Promise.all([SettingHelper.load(SettingKey.SMS_OTP)]);
        const content = UtilsHelper.parseStringWithInfo({
          data: smsTemplate,
          info: {
            SHOP_NAME: member.shopName,
            OTP: OTP,
          },
        });
        const result = await esms.send(member.phone, content);
        if (!result.success) {
          await cache.del(`member:OTP:${member._id}`);
          return "Xảy ra lỗi trong quá trình gửi tin nhắn";
        }
        return "Tin nhắn đã được gửi đi.";
      },
      memberResetPasswordGetToken: async (root: any, args: any, context: Context) => {
        const { OTP, code } = args;

        const member = await notFoundHandler(await MemberModel.findOne({ code: code }));
        const cacheOTP = await cache.get(`member:OTP:${member._id}`);
        if (!cacheOTP || cacheOTP !== OTP) {
          throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
        }
        await cache.del(`member:OTP:${member._id}`);
        const oneTimeToken = passwordHash.generate(member.password + OTP);

        return {
          token: TokenHelper.generateToken(
            {
              role: ROLES.ANONYMOUS,
              _id: member._id,
              oneTimeToken: oneTimeToken,
              OTP: cacheOTP,
              username: member.username,
              createdAt: new Date(),
            },
            "5m"
          ),
        };
      },
      memberResetPasswordByToken: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ANONYMOUS]);
        const { code, newPassword } = args;

        const { oneTimeToken, OTP } = _.get(context, "tokenData");
        if (!oneTimeToken || !OTP) throw ErrorHelper.permissionDeny();
        const member = await notFoundHandler(await MemberModel.findOne({ code: code }));

        // Kiểm tra oneTimeToken
        if (!passwordHash.verify(member.password + OTP, oneTimeToken)) {
          throw ErrorHelper.permissionDeny();
        }

        if (newPassword.length < 6) {
          throw new Error("Mật khẩu phải lớn hơn 6 kí tự");
        }
        member.password = passwordHash.generate(newPassword);
        await member.save();
        return `Đổi mật khẩu thành công`;
      },
    },
  },
};
