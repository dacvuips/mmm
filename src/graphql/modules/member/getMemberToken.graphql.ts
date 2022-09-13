import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import { TokenHelper } from "../../../helpers/token.helper";
import { Context } from "../../context";
import { MemberModel } from "./member.model";

export default {
  schema: gql`
    extend type Query {
      getMemberToken(memberId: ID!): String
    }
  `,
  resolver: {
    Query: {
      getMemberToken: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { memberId } = args;
        const member = await MemberModel.findById(memberId);

        return TokenHelper.generateToken({
          role: ROLES.MEMBER,
          _id: member._id,
          username: member.username,
          createdAt: new Date(),
        });
      },
    },
  },
};
