import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import casso from "../../../helpers/casso";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";

export default {
  schema: gql`
    extend type Mutation {
      markTransferComplete: String
    }
  `,
  resolver: {
    Mutation: {
      markTransferComplete: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.MEMBER_STAFF_CUSTOMER);
        // Kiểm tra kết nối casso
        const shopConfig: IShopConfig = await LocalBroker.call(`shopConfig.get`, {
          id: context.sellerId,
        });
        if (shopConfig.cassoStatus == "disconnect") {
          // Chưa kết nối casso
          return `Chưa kết nối casso`;
        }

        // Láy thông tin tài khoản
        const {
          cassoUser: { bankAccs },
          cassoApiKey,
        } = shopConfig;
        const token = await casso.getToken(cassoApiKey);
        // Đồng bộ thanh toán của ngân hàng
        for (const acc of bankAccs) {
          logger.info(`Đồng bộ giao dịch Tài khoản ngân hàng [${acc.bankSubAccId}]`);
          await casso.syncTransaction(token, acc.bankSubAccId);
        }
        return `Đã đồng bộ, chờ xử lý giao dịch.`;
      },
    },
  },
};
