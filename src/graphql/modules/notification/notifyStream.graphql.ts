import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import { pubsub } from "../../../helpers/pubsub";
import { Context } from "../../context";
import { IOrder } from "../order/order.model";
import { INotification, NotificationTarget } from "./notification.model";
import { withFilter } from "graphql-subscriptions";

export default {
  schema: gql`
    extend type Subscription {
      notifyStream: Notification
    }
  `,
  resolver: {
    Subscription: {
      notifyStream: {
        resolve: (payload: any) => payload,
        subscribe: withFilter(
          (root: any, args: any, context: Context) => {
            context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
            return pubsub.asyncIterator(["notify"]);
          },
          async (payload: INotification, args: any, context: Context) => {
            switch (payload.target) {
              case NotificationTarget.CUSTOMER:
                return payload.customerId.toString() == context.id;
              case NotificationTarget.MEMBER:
                return payload.memberId.toString() == context.id;
              case NotificationTarget.STAFF:
                return payload.staffId.toString() == context.id;
              case NotificationTarget.USER:
                return payload.userId.toString() == context.id;
            }
          }
        ),
      },
    },
  },
};
