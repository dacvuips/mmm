import moment from "moment-timezone";
import { onCanceledOrder } from "../../../../events/onCanceledOrder.event";
import {
  OrderModel,
  OrderStatus,
  PaymentMethod,
  PickupMethod,
} from "../../../../graphql/modules/order/order.model";
import { OrderItemModel } from "../../../../graphql/modules/orderItem/orderItem.model";
import { logger } from "../../../../loaders/logger";
import { Miniute10Context } from "../common";

export default async function execute(ctx: Miniute10Context) {
  const pendingOrders = await OrderModel.find({
    status: OrderStatus.PENDING, // Đang chờ xử lý
    pickupMethod: PickupMethod.DELIVERY, // Giao hàng
    paymentMethod: PaymentMethod.MOMO, // Thanh toán bằng momo
    createdAt: { $lte: moment().subtract(10, "minute").toDate() }, // Đã được tạo hơn 10 phút trước
  });

  if (pendingOrders.length == 0) return;

  logger.info(`Tự động huỷ đơn chưa thanh toán momo`, { pendingOrders: pendingOrders.length });

  const orderIds = pendingOrders.map((o) => o._id);
  await OrderModel.updateMany(
    { _id: { $in: orderIds } },
    { status: OrderStatus.CANCELED, cancelReason: `Hết thời hạn thanh toán` }
  ).exec();
  await OrderItemModel.updateMany(
    { orderId: { $in: orderIds } },
    { $set: { status: OrderStatus.CANCELED } }
  ).exec;

  const updatedOrders = await OrderModel.find({ _id: { $in: orderIds } });
  updatedOrders.forEach((o) => onCanceledOrder.next(o));
}
