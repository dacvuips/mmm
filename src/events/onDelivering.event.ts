import _ from "lodash";
import { Subject } from "rxjs";

import { SettingKey } from "../configs/settingData";
import { CustomerLoader } from "../graphql/modules/customer/customer.model";
import { MemberLoader } from "../graphql/modules/member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../graphql/modules/notification/notification.model";
import { IOrder, OrderStatus } from "../graphql/modules/order/order.model";
import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import { ShopConfigModel } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { staffService } from "../graphql/modules/staff/staff.service";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import {
  UtilsHelper,
  VNPostCancelStatus,
  VNPostFailedStatus,
  VNPostSuccessStatus,
} from "../helpers";
import esms from "../helpers/esms";
import { pubsub } from "../helpers/pubsub";
import { TokenHelper } from "../helpers/token.helper";
import { onApprovedCompletedOrder } from "./onApprovedCompletedOrder.event";
import { onApprovedFailureOrder } from "./onApprovedFailureOrder.event";
import { onCanceledOrder } from "./onCanceledOrder.event";

export const onDelivering = new Subject<IOrder>();

// Đơn giao bị huỷ
onDelivering.subscribe(async (order) => {
  if (
    !VNPostCancelStatus.includes(order.deliveryInfo.status) ||
    order.status != OrderStatus.DELIVERING
  )
    return;
  order.status = OrderStatus.CANCELED;
  order.note = order.deliveryInfo.statusText;
  await order.save();
  onCanceledOrder.next(order);
});

// Đơn giao không thành công
onDelivering.subscribe(async (order) => {
  if (
    !VNPostFailedStatus.includes(order.deliveryInfo.status) ||
    order.status != OrderStatus.DELIVERING
  )
    return;
  order.status = OrderStatus.FAILURE;
  order.note = order.deliveryInfo.statusText;
  await order.save();
  onApprovedFailureOrder.next(order);
});

// Đơn giao thành công
onDelivering.subscribe(async (order) => {
  if (
    !VNPostSuccessStatus.includes(order.deliveryInfo.status) ||
    order.status != OrderStatus.DELIVERING
  )
    return;
  order.status = OrderStatus.COMPLETED;
  order.note = order.deliveryInfo.statusText;
  await order.save();
  onApprovedCompletedOrder.next(order);
});

// Thông báo khách hàng cập nhật trạng thái giao hàng
onDelivering.subscribe(async (order) => {
  const notify = new NotificationModel({
    target: NotificationTarget.CUSTOMER,
    type: NotificationType.ORDER,
    customerId: order.buyerId,
    title: `Đơn hàng #${order.code}`,
    body: order.deliveryInfo.statusText,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Thông báo nhân viên cập nhật trang thái giao hàng
onDelivering.subscribe(async (order) => {
  const staffs = await staffService.getStaffByBranchAndScope(order.sellerId, order.shopBranchId);
  const notifies = staffs.map(
    (s) =>
      new NotificationModel({
        target: NotificationTarget.STAFF,
        type: NotificationType.ORDER,
        staffId: s._id,
        title: `Đơn hàng #${order.code}`,
        body: order.deliveryInfo.statusText,
        orderId: order._id,
      })
  );
  if (notifies.length > 0) {
    InsertNotification(notifies);
  }
});

// Thông báo chủ shop cập nhật trạng thái giao hàng
onDelivering.subscribe(async (order) => {
  const notify = new NotificationModel({
    target: NotificationTarget.MEMBER,
    type: NotificationType.ORDER,
    staffId: order.sellerId,
    title: `Đơn hàng #${order.code}`,
    body: order.deliveryInfo.statusText,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Publish order stream
onDelivering.subscribe(async (order) => {
  pubsub.publish("order", order);
});
// Gửi trigger
// onDelivering.subscribe(async (order) => {
//   const { sellerId } = order;
//   triggerService.emitEvent("order:delivering", sellerId, order);
// });

// Thông báo SMS tới khách hàng
onDelivering.subscribe(async (order) => {
  const [seller, buyer, smsTemplate, webappDomain, shopConfig] = await Promise.all([
    MemberLoader.load(order.sellerId),
    CustomerLoader.load(order.buyerId),
    SettingHelper.load(SettingKey.SMS_DELIVERING),
    SettingHelper.load(SettingKey.WEBAPP_DOMAIN),
    ShopConfigModel.findOne({ memberId: order.sellerId }),
  ]);
  const featureSMS = _.get(shopConfig, "features.sms", false);
  if (!shopConfig.smsOrder) return;
  // const customerToken = TokenHelper.getCustomerToken(buyer);
  const orderLink = `${webappDomain}/order`;
  // const encoded = await LocalBroker.call<string, any>("shortLink.encode", { url: orderLink });
  const context = {
    SHOP_NAME: seller.shopName,
    SHOP_CODE: seller.code,
    ORDER_CODE: order.code,
    DOMAIN: webappDomain,
    ORDER_LINK: orderLink,
  };
  const parsedMsg = UtilsHelper.parseStringWithInfo({ data: smsTemplate, info: context });

  await esms.send(order.buyerPhone, parsedMsg);
});
