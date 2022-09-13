import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import zaloOa from "../../../helpers/zalo/zaloOa";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";
import { getZaloToken } from "../shop/shopConfig/zalo/common";
import { ZaloConfigStatus } from "../shop/shopConfig/zalo/zaloConfig.graphql";
import { CustomerModel } from "./customer.model";

export default {
  schema: gql`
    extend type Mutation {
      updateCustomerFollowerId(followerId: String!): String
    }
  `,
  resolver: {
    Mutation: {
      updateCustomerFollowerId: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const customer = await CustomerModel.findById(context.id);
        const { followerId } = args;

        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: customer.memberId.toString(),
        });
        const {
          zaloConfig: { active, status },
        } = shopConfig;

        if (active == false || status != ZaloConfigStatus.connected) {
          return "Chưa liên kết Zalo OA";
        }

        const token = await getZaloToken(shopConfig);
        const userInfo = await zaloOa.getProfile(token, followerId);
        if (!userInfo) {
          return "Tài khoản không tòn tại";
        }

        customer.followerId = followerId;
        customer.zaloFollower = userInfo;
        await customer.save();
        return "Đã cập nhật";
      },
    },
  },
};
