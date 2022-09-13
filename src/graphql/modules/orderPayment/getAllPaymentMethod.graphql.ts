import { gql } from "apollo-server-express";
import _ from "lodash";
import { ROLES } from "../../../constants/role.const";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { PaymentMethod } from "../order/order.model";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";

export default {
  schema: gql`
    extend type Query {
      getAllPaymentMethod: Mixed
    }
  `,
  resolver: {
    Query: {
      getAllPaymentMethod: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: context.sellerId,
        });
        const methods: any[] = [];
        const { codEnabled, momoEnabled, vnpayEnabled, cassoEnabled, zalopayEnabled } = shopConfig;
        if (codEnabled == true) {
          methods.push({ label: "COD", value: PaymentMethod.COD });
        }
        if (momoEnabled) methods.push({ label: "MOMO", value: PaymentMethod.MOMO });
        if (zalopayEnabled) methods.push({ label: "ZaloPay", value: PaymentMethod.ZALO_PAY });
        if (vnpayEnabled) methods.push({ label: "VNPay", value: PaymentMethod.VNPAY });
        // if (cassoEnabled)
        //   methods.push({ label: "Chuyển khoản", value: PaymentMethod.BANK_TRANSFER });
        return methods;
      },
    },
  },
};
