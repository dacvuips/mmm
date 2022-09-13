import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import manychat from "../../../helpers/manychat";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";
import { CustomerModel, ICustomer } from "./customer.model";

export default {
  schema: gql`
    extend type Mutation {
      updateCustomerPSID(psid: String!): String
    }
  `,
  resolver: {
    Mutation: {
      updateCustomerPSID: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const customer = await CustomerModel.findById(context.id);
        const { psid } = args;
        customer.psid = psid;

        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: customer.memberId.toString(),
        });

        await setManychatInfo(shopConfig, psid, customer);

        await customer.save();
        return "Đã cập nhật";
      },
    },
  },
};

async function setManychatInfo(shopConfig: IShopConfig, psid: any, customer: ICustomer) {
  try {
    const {
      manychatConfig: { active, apiKey, status },
    } = shopConfig;
    if (active && status === "connected") {
      const userInfo = await manychat.findSubscriberByPSID(apiKey, psid);
      if (userInfo) {
        customer.manychatSubscriber = userInfo;
      }
    }
  } catch (error) {
    logger.error(`Lỗi khi cập nhật tài khoản manychat`, error);
  }
}
