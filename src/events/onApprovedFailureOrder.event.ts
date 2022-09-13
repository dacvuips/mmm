import _ from "lodash";
import { Subject } from "rxjs";

import { configs } from "../configs";
import { SettingKey } from "../configs/settingData";
import { MemberLoader } from "../graphql/modules/member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../graphql/modules/notification/notification.model";
import { IOrder, OrderStatus } from "../graphql/modules/order/order.model";
import { orderService } from "../graphql/modules/order/order.service";
import { OrderLogModel, OrderLogType } from "../graphql/modules/orderLog/orderLog.model";
import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import { IShopConfig } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { staffService } from "../graphql/modules/staff/staff.service";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import { UtilsHelper } from "../helpers";
import esms from "../helpers/esms";
import { pubsub } from "../helpers/pubsub";
import LocalBroker from "../services/broker";

export const onApprovedFailureOrder = new Subject<IOrder>();

onApprovedFailureOrder.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, id, status, toMemberId } = order;

  if (status === OrderStatus.FAILURE) {
    const log = new OrderLogModel({
      orderId: id,
      type: OrderLogType.MEMBER_FAILURE,
      memberId: sellerId,
      customerId: buyerId,
      orderStatus: status,
    });

    if (toMemberId) {
      log.toMemberId = toMemberId;
      log.type = OrderLogType.TO_MEMBER_FAILURE;
    }

    await log.save().then((log) => {
      orderService.updateLogToOrder({ order, log });
    });
  }
});

// Thông báo đơn thành công tới khách hàng
onApprovedFailureOrder.subscribe(async (order) => {
  const message = await getOrderFailureNotifyMessage(order);
  const notify = new NotificationModel({
    target: NotificationTarget.CUSTOMER,
    type: NotificationType.ORDER,
    customerId: order.buyerId,
    title: `Đơn hàng #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Thông báo nhân viên đơn hàng thành công
onApprovedFailureOrder.subscribe(async (order) => {
  const staffs = await staffService.getStaffByBranchAndScope(order.sellerId, order.shopBranchId);
  const message = await getOrderFailureNotifyMessage(order, true);
  const notifies = staffs.map(
    (s) =>
      new NotificationModel({
        target: NotificationTarget.STAFF,
        type: NotificationType.ORDER,
        staffId: s._id,
        title: `Đơn hàng #${order.code}`,
        body: message,
        orderId: order._id,
      })
  );
  if (notifies.length > 0) {
    InsertNotification(notifies);
  }
});

// Thông báo chủ shop đơn hàng thành công
onApprovedFailureOrder.subscribe(async (order) => {
  const message = await getOrderFailureNotifyMessage(order, true);
  const notify = new NotificationModel({
    target: NotificationTarget.MEMBER,
    type: NotificationType.ORDER,
    memberId: order.sellerId,
    title: `Đơn hàng #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Publish order stream
onApprovedFailureOrder.subscribe(async (order) => {
  pubsub.publish("order", order);
});
// Gửi trigger
onApprovedFailureOrder.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:canceled", sellerId, order);
});

onApprovedFailureOrder.subscribe(async (order) => {
  LocalBroker.emit("order.failure", { orderId: order._id.toString() });
});

async function getOrderFailureNotifyMessage(order: IOrder, forStaff = false) {
  const defaultMsg = `Đơn hàng bị huỷ. ${order.note}`;
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const orderFailureMgs = _.get(shopConfig, "notifyConfig.orderFailure", defaultMsg);
  const orderFailureMgsForStaff = _.get(
    shopConfig,
    "notifyConfig.orderFailureForStaff",
    defaultMsg
  );
  const message = forStaff ? orderFailureMgsForStaff : orderFailureMgs;
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}

// Thông báo SMS tới khách hàng
onApprovedFailureOrder.subscribe(async (order) => {
  const [seller, smsTemplate, shopConfig] = await Promise.all([
    MemberLoader.load(order.sellerId),
    SettingHelper.load(SettingKey.SMS_ORDER_CANCALED),
    LocalBroker.call<IShopConfig, any>("shopConfig.get", { id: order.sellerId.toString() }),
  ]);
  if (!shopConfig.smsOrder) return;
  // const customerToken = TokenHelper.getCustomerToken(buyer);
  const orderLink = `${configs.domain}/order/${order.code}`;
  // const encoded = await LocalBroker.call<string, any>("shortLink.encode", { url: orderLink });
  const context = {
    SHOP_NAME: seller.shopName,
    SHOP_CODE: seller.code,
    ORDER_CODE: order.code,
    DOMAIN: configs.domain,
    ORDER_LINK: orderLink,
  };
  const parsedMsg = UtilsHelper.parseStringWithInfo({ data: smsTemplate, info: context });

  await esms.send(order.buyerPhone, parsedMsg);
});
