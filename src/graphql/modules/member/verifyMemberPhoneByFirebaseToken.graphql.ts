import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import { ErrorHelper, UtilsHelper } from "../../../helpers";
import { firebaseHelper } from "../../../helpers/firebase.helper";
import { Context } from "../../context";
import { MemberModel } from "./member.model";

export default {
  schema: gql`
    extend type Mutation {
      verifyMemberPhoneByFirebaseToken(token: String!): Member
    }
  `,
  resolver: {
    Mutation: {
      verifyMemberPhoneByFirebaseToken: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { token } = args;
        let decode = await firebaseHelper.verifyIdToken(token);
        let phone = decode.phone_number;
        if (!phone) throw ErrorHelper.badToken();

        phone = UtilsHelper.parsePhone(phone, "0");

        const member = await MemberModel.findById(context.sellerId);

        if (UtilsHelper.parsePhone(member.phone, "0") != phone) {
          throw new Error("Số điện thoại không đúng với số chủ shop");
        }

        member.phoneVerified = true;
        await member.save();

        return member;
      },
    },
  },
};
