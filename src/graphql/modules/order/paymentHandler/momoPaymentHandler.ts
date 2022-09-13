import _ from "lodash";
import { BaseError } from "../../../../base/error";
import { configs } from "../../../../configs";
import { onCanceledOrder } from "../../../../events/onCanceledOrder.event";
import { UtilsHelper } from "../../../../helpers";
import { pubsub } from "../../../../helpers/pubsub";
import { logger } from "../../../../loaders/logger";
import { PaymentStatus } from "../../mixin/payment.graphql";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../../notification/notification.model";
import { OrderItemModel } from "../../orderItem/orderItem.model";
import { OrderLoader, OrderModel, OrderStatus } from "../order.model";

export default async function execute(transaction: any) {
  const { extraData, orderId: code } = transaction;
  const {
    momo: { partnerCode },
  } = configs;

  const ctx: any = {
    input: { transaction },
    meta: {
      logger: logger.child({ _reqId: code }),
    },
  };
  if (partnerCode != transaction.partnerCode || extraData.startsWith("shop:") == false) {
    // Bỏ quà nếu không phải giao dịnh của chủ shop
    return;
  }
  await ensureOrder(ctx);
  await notifyOrder(ctx);
}

async function notifyOrder(ctx: any) {
  const {
    input: {
      transaction: { amount, resultCode },
    },
    meta: { order, logger },
  } = ctx;
  pubsub.publish("order", order);

  if (resultCode != 0) {
    // Thanh toán ko thành công, bỏ qua
    return;
  }

  logger.info(`Gửi thông báo thanh toán tới khách hàng`);
  const notify = new NotificationModel({
    target: NotificationTarget.CUSTOMER,
    type: NotificationType.ORDER,
    customerId: order.buyerId,
    title: `Đơn hàng #${order.code}`,
    body: `Thanh toán MOMO thành công. Số tiền: ${UtilsHelper.toMoney(amount)}đ`,
    orderId: order._id,
  });
  await InsertNotification([notify]);
}

async function ensureOrder(ctx: any) {
  const {
    input: { transaction },
    meta: { logger },
  } = ctx;
  const { requestId: orderId, amount, resultCode, message } = transaction;

  const order = await OrderLoader.load(orderId);
  if (_.isEmpty(order) == true) {
    // Đơn hàng không tồn tại
    throw new BaseError(500, `momo-payment-handler-error`, `Đơn hàng không tồn tại`);
  }

  if (resultCode == 0) {
    // Thanh toán thành công
    logger.info(`Thanh toán đơn hàng bằng MOMO`);

    // Tạo log thanh toán
    const log = {
      message: `Thanh toán thành công qua Momo. Số tiền: ${UtilsHelper.toMoney(amount)}`,
      createdAt: new Date(),
      meta: transaction,
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
    // Cập nhật trạng thái đơn hàng
    await order.save();
    await order.updateOne({ $push: { paymentLogs: log } }).exec();
  } else {
    // Thanh toán thất bại, huỷ đơn
    order.paymentStatus = PaymentStatus.rejected;
    order.status = OrderStatus.CANCELED;
    order.cancelReason = message;
    order.paymentLogs.push({
      message: message,
      createdAt: new Date(),
      meta: transaction,
    });
    order.markModified("paymentLogs");
    await order.save();
    await OrderItemModel.updateMany(
      { orderId: order._id },
      { $set: { status: OrderStatus.CANCELED } }
    ).exec;
    onCanceledOrder.next(order);
  }

  // Populate context
  ctx.meta = {
    ...ctx.meta,
    order,
  };
}
