import { gql } from "apollo-server-express";
import cache from "../../../helpers/cache";
import { validateEmail } from "../../../helpers/email/validateEmail";
import { Context } from "../../context";
import { MemberModel } from "./member.model";

export default {
  schema: gql`
    extend type Mutation {
      updateMemberEmail(
        "Email đã nhận được mã OTP"
        emailOTP: String!
        "Mã OTP"
        OTP: String!
        "New email"
        newEmail: String!
      ): Mixed
    }
  `,
  resolver: {
    Mutation: {
      updateMemberEmail: async (root: any, args: any, context: Context) => {
        const { emailOTP, OTP, newEmail } = args; // 📌
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
        // step 3:validate email then update email
        if (!validateEmail(newEmail)) {
          throw new Error("Email is invalid");
        }
        member.username = newEmail;
        await member.save();
        // step 4: remove otp code from cache
        await cache.del(`member:OTP:${member._id}`);
        // 👉
        return `Update email from ${emailOTP} to ${newEmail} successfully`;
      },
    },
  },
};
