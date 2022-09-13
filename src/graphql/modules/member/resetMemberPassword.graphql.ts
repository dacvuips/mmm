import { gql } from "apollo-server-express";
import passwordHash from "password-hash";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { MemberModel } from "./member.model";

export default {
  schema: gql`
    extend type Mutation {
      resetMemberPassword(
        "Email đã nhận được mã OTP"
        emailOTP: String!
        "Mã OTP"
        OTP: String!
        "New password"
        newPassword: String!
      ): Mixed
    }
  `,
  resolver: {
    Mutation: {
      resetMemberPassword: async (root: any, args: any, context: Context) => {
        const { emailOTP, OTP, newPassword } = args; // 📌

        // step 1: check email has member account
        const member = await MemberModel.findOne({ username: emailOTP });
        if (!member) {
          throw new Error(`Not found email ${emailOTP}`);
        }
        // step 2: check OTP code is correct
        const OTPCode = await cache.get(`member:OTP:${member._id}`);
        if (OTPCode !== OTP) {
          throw new Error("OTP is incorrect or expired");
        }
        // step 3: hash password and update password
        // password length must be greater than 6 characters
        if (newPassword.length < 6) {
          throw new Error("Password must be greater than 6 characters");
        }
        member.password = passwordHash.generate(newPassword);
        await member.save();
        // step 4: remove otp code from cache
        await cache.del(`member:OTP:${member._id}`);
        // 👉
        return `Đổi mật khẩu cho email ${emailOTP} thành công`;
      },
    },
  },
};
