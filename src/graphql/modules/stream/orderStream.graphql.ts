import { gql } from "apollo-server-express";
import { withFilter } from "graphql-subscriptions";

import { ROLES } from "../../../constants/role.const";
import { pubsub } from "../../../helpers/pubsub";
import { Context } from "../../context";
import { IOrder, OrderModel } from "../order/order.model";

export default {
  schema: gql`
    extend type Subscription {
      orderStream: Order
    }
  `,
  resolver: {
    Subscription: {
      orderStream: {
        resolve: (payload: any) => OrderModel.hydrate(payload),
        subscribe: withFilter(
          (root: any, args: any, context: Context) => {
            context.auth(ROLES.MEMBER_STAFF_CUSTOMER);
            return pubsub.asyncIterator(["order"]);
          },
          async (payload: IOrder, args: any, context: Context) => {
            if (payload.sellerId.toString() != context.sellerId.toString()) {
              return false;
            }
            if (context.isCustomer()) {
              return payload.buyerId.toString() == context.id;
            }
            return true;
          }
        ),
      },
    },
  },
};
