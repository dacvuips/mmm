import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import zalo from "../../../helpers/zalo";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";
import { getZaloToken } from "../shop/shopConfig/zalo/common";
import { ZaloConfigStatus } from "../shop/shopConfig/zalo/zaloConfig.graphql";

export default {
  schema: gql`
    extend type Mutation {
      zaloBroadcast(message: Mixed): String
    }
  `,
  resolver: {
    Mutation: {
      zaloBroadcast: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { message } = args;

        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: context.sellerId,
        });

        const {
          zaloConfig: { active, status },
        } = shopConfig;

        if (active == false || status != ZaloConfigStatus.connected) {
          throw Error("Chưa liên kết ZaloOA");
        }

        const token = await getZaloToken(shopConfig);
        await zalo.message(token, message);
        return "Gửi tin thành công";
      },
    },
  },
};
