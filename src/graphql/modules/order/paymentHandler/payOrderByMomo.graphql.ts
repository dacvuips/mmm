import { gql } from "apollo-server-express";
import _ from "lodash";

import { configs } from "../../../../configs";
import { ROLES } from "../../../../constants/role.const";
import { onCanceledOrder } from "../../../../events/onCanceledOrder.event";
import { ErrorHelper, UtilsHelper } from "../../../../helpers";
import momo from "../../../../helpers/momo";
import { logger } from "../../../../loaders/logger";
import { Context } from "../../../context";
import { PaymentStatus } from "../../mixin/payment.graphql";
import { OrderItemModel } from "../../orderItem/orderItem.model";
import { OrderModel, OrderStatus, PaymentMethod } from "../order.model";

export default {
  schema: gql`
    extend type Mutation {
      payOrderByMomo(orderId: ID!, appToken: String!, phoneNumber: String!): Order
    }
  `,
  resolver: {
    Mutation: {
      payOrderByMomo: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const { orderId: id, appToken, phoneNumber } = args;
        const order = await OrderModel.findById(id);
        if (!order) throw Error("Không có đơn hàng");
        if (order.buyerId.toString() != context.id) throw ErrorHelper.permissionDeny();
        if (order.paymentMethod != PaymentMethod.MOMO)
          throw Error("Không thể thanh toán bằng ví Momo.");
        if (order.paymentStatus != PaymentStatus.pending) throw Error("Không thể thanh toán.");
        const {
          momo: { publicKey, secretKey },
        } = configs;
        const {
          paymentMeta: { partnerCode, partnerName, orderId, amount, description, extra },
        } = order;
        try {
          const result = await momo.payApp({
            customerNumber: phoneNumber,
            partnerCode: partnerCode,
            partnerRefId: orderId,
            amount: amount,
            publicKey: publicKey,
            appData: appToken,
            // partnerTransId: order._id.toString(),
            // partnerName: partnerName,
            // description: description,
            // extra_data: extra,
          });
          if (result.status == 0) {
            const { amount } = result;
            // Thanh toán thành công
            logger.info(`Thanh toán đơn hàng bằng MOMO`, { result });

            // Tạo log thanh toán
            const log = {
              message: `Thanh toán thành công qua Momo. Số tiền: ${UtilsHelper.toMoney(amount)}`,
              createdAt: new Date(),
              meta: result,
            };

            // Tính toán tổng tiền thanh toán
            order.paymentFilledAmount += amount;

            if (order.paymentFilledAmount < order.amount) {
              // Tổng số tiền thanh toán chưa đủ với yêu cầu thanh toán
              order.paymentStatus = PaymentStatus.partially_filled;
            } else {
              // Ngược lại thì thanh toán đầy đủ
              order.paymentStatus = PaymentStatus.filled;
            }
            logger.info(`Tính toán tổng tiền thanh toán`, {
              filledAmount: order.paymentFilledAmount,
              requestAmount: order.amount,
              paymentStatus: order.paymentStatus,
            });

            await momo.confirmTransaction({
              partnerCode: partnerCode,
              partnerRefId: orderId,
              requestType: "capture",
              requestId: order._id,
              momoTransId: result.transid,
              customerNumber: phoneNumber,
              secretKey: secretKey,
            });

            // Cập nhật trạng thái đơn hàng
            await order.save();
            await order.updateOne({ $push: { paymentLogs: log } }).exec();
            return order;
          } else {
            const err = new Error(result.message);
            _.set(err, "result", result);
            throw err;
          }
        } catch (err) {
          // Thanh toán thất bại, huỷ đơn
          order.paymentStatus = PaymentStatus.rejected;
          order.status = OrderStatus.CANCELED;
          order.cancelReason = err.message;
          order.paymentLogs.push({
            message: err.message,
            createdAt: new Date(),
            meta: err.result,
          });
          order.markModified("paymentLogs");
          await order.save();
          await OrderItemModel.updateMany(
            { orderId: order._id },
            { $set: { status: OrderStatus.CANCELED } }
          ).exec;
          onCanceledOrder.next(order);
          throw err;
        }
      },
    },
  },
};
