import { gql } from "apollo-server-express";
import { Types } from "mongoose";
import { ROLES } from "../../../../constants/role.const";
import { ErrorHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { OrderModel } from "../order.model";

export default {
  schema: gql`
    extend type Mutation {
      customerConfirmOrder(id: ID!): Order
    }
    extend type Order {
      "Khách hàng xác nhận đã nhận hàng"
      customerReceiveConfirm: Boolean
    }
  `,
  resolver: {
    Mutation: {
      customerConfirmOrder: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const { id } = args;
        const order = await OrderModel.findById(id);
        if (!order) throw ErrorHelper.requestDataInvalid("Đơn hàng không hợp lệ");
        if (order.buyerId.toString() !== context.id.toString()) throw ErrorHelper.permissionDeny();
        order.customerReceiveConfirm = true;
        await order.save();
        return order;
      },
    },
  },
};
