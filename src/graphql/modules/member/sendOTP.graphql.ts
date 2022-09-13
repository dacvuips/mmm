import { gql } from "apollo-server-express";
import dotenv from "dotenv";
import _ from "lodash";
import nodemailer from "nodemailer";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { MemberModel } from "./member.model";

dotenv.config();

export default {
  schema: gql`
    extend type Mutation {
      sendOTP("Email để nhận OTP" emailOTP: String): Mixed
    }
  `,
  resolver: {
    Mutation: {
      sendOTP: async (root: any, args: any, context: Context) => {
        const { emailOTP } = args;
        const member = await MemberModel.findOne({ username: emailOTP }); // 📌Note: database save username with email
        if (!member) {
          throw new Error(`Not found email ${emailOTP}`);
        }
        // generate OTP code
        const OTPCode = _.random(100000, 999999).toString();
        // save OTP code to redis cache, and cache 5 minutes
        cache.set(`member:OTP:${member._id}`, OTPCode, 60 * 5);
        // send email
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || "gmail",
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: emailOTP,
          subject: "OTP CODE",
          text: `Your OTP code is ${OTPCode}`,
        };
        try {
          await transporter.sendMail(mailOptions);
        } catch (error) {
          throw new Error(error);
        }
        return "Send OTP code to " + emailOTP + " successfully";
      },
    },
  },
};
