import { gql } from "apollo-server-express";
import { Ahamove } from "../../../helpers/ahamove/ahamove";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { IOrder, ShipMethod } from "./order.model";

export default {
  schema: gql`
    extend type Order {
      ahamoveTrackingLink: String
    }
  `,
  resolver: {
    Order: {
      ahamoveTrackingLink: async (root: IOrder, args: any, context: Context) => {
        if (!root.shipMethod || root.shipMethod != ShipMethod.AHAMOVE || !root.deliveryInfo.orderId)
          return null;
        const ahamove = new Ahamove({});
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: root.fromMemberId.toString(),
        });
        return await ahamove
          .getTrackingLink(shopConfig.shipAhamoveToken, root.deliveryInfo.orderId)
          .then((res) => res.shared_link)
          .catch((err) => null);
      },
    },
  },
};
