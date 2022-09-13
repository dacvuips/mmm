import { CrudService } from "../../../base/crudService";
import momo from "../../../helpers/momo";
import { OrderItemModel } from "../orderItem/orderItem.model";
import { IOrderLog } from "../orderLog/orderLog.model";
import { IOrder, OrderModel, OrderStatus } from "./order.model";
import momoPaymentHandler from "./paymentHandler/momoPaymentHandler";

class OrderService extends CrudService<typeof OrderModel> {
  constructor() {
    super(OrderModel);

    momo.on("paid", momoPaymentHandler);
  }

  updateLogToOrder = async ({ order, log }: { order: IOrder; log: IOrderLog }) => {
    const setData: any = {
      $push: { orderLogIds: log._id },
      loggedAt: log.createdAt,
    };
    switch (log.orderStatus) {
      case OrderStatus.COMPLETED:
      case OrderStatus.CANCELED:
      case OrderStatus.FAILURE:
        setData.finishedAt = log.createdAt;
    }
    await Promise.all([
      order.updateOne({ $set: setData }).exec(),
      OrderItemModel.updateMany(
        { orderId: order._id },
        { $set: { finishedAt: setData.finishedAt || order.finishedAt, status: log.orderStatus } }
      ).exec(),
    ]);
  };
}

const orderService = new OrderService();

export { orderService };
