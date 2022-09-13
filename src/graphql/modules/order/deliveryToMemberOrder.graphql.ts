import { gql } from "apollo-server-express";
import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { onMemberDelivering } from "../../../events/onMemberDelivering.event";
import { Context } from "../../context";
import { OrderModel, OrderStatus } from "./order.model";

export default {
  schema: gql`
    extend type Mutation {
      deliveryToMemberOrder(orderId: ID!): Order
    }
  `,
  resolver: {
    Mutation: {
      deliveryToMemberOrder: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.MEMBER_STAFF);
        const { orderId } = args;
        const order = await OrderModel.findById(orderId);
        if (!order || order.status != OrderStatus.CONFIRMED) throw Error("Đơn hàng không thể giao");
        if (order.toMemberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
        order.status = OrderStatus.DELIVERING;
        await order.save();
        onMemberDelivering.next(order);
        return order;
      },
    },
  },
};
