import _ from "lodash";
import { IOrder } from "../../order/order.model";
import { RewardPointLogModel, RewardPointLogType } from "./rewardPointLog.model";

export class RewardPointLogBuilder {
  constructor(public data: any = {}) {}

  static useForOrder(order: IOrder, value: number) {
    return new RewardPointLogModel({
      memberId: order.fromMemberId,
      customerId: order.buyerId,
      type: RewardPointLogType.USE_FOR_ORDER,
      value: -value,
      meta: {
        orderId: order._id,
      },
    });
  }

  static receiveFromOrder(order: IOrder) {
    return new RewardPointLogModel({
      memberId: order.fromMemberId,
      customerId: order.buyerId,
      type: RewardPointLogType.RECEIVE_FROM_ORDER,
      value: order.rewardPoint,
      meta: {
        orderId: order._id,
      },
    });
  }
}
