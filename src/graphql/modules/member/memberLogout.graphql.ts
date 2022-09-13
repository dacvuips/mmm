import { gql } from "apollo-server-express";
import { ROLES } from '../../../constants/role.const';
import { Context } from "../../context";
import { DeviceInfoModel } from "../deviceInfo/deviceInfo.model";

export default {
  schema: gql`
    extend type Mutation {
      "Chủ shop đăng xuất"
      memberLogout(deviceToken: String!): String
    }
  `,
  resolver: {
    Mutation: {
      memberLogout: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { deviceToken } = args;
        await DeviceInfoModel.remove({ memberId: context.sellerId, deviceToken }).exec();
        return "Đã đăng xuất";
      },
    },
  },
};
