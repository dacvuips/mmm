import { Subject } from "rxjs";
import { IOrder } from "../graphql/modules/order/order.model";
import { orderService } from "../graphql/modules/order/order.service";
import { OrderLogModel } from "../graphql/modules/orderLog/orderLog.model";
import { OrderLogType } from "../graphql/modules/orderLog/orderLog.model";
import { pubsub } from "../helpers/pubsub";

export const onTransfering = new Subject<IOrder>();

// luu log lai
onTransfering.subscribe(async (order) => {
  const { buyerId, sellerId, id, status, toMemberId } = order;

  const log = new OrderLogModel({
    orderId: id,
    type: OrderLogType.TRANSFERED,
    memberId: sellerId,
    toMemberId: toMemberId,
    customerId: buyerId,
    orderStatus: status,
  });

  await log.save().then((log) => {
    orderService.updateLogToOrder({ order, log });
  });
});

// Publish order stream
onTransfering.subscribe(async (order) => {
  pubsub.publish("order", order);
});
