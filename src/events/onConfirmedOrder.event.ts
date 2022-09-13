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
import { IShopConfig, ShopConfigModel } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { TriggerModel } from "../graphql/modules/trigger/trigger.model";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import { UtilsHelper } from "../helpers";
import esms from "../helpers/esms";
import { pubsub } from "../helpers/pubsub";
import { logger } from "../loaders/logger";
import LocalBroker from "../services/broker";

export const onConfirmedOrder = new Subject<IOrder>();

onConfirmedOrder.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, id, status, toMemberId } = order;

  const log = new OrderLogModel({
    orderId: id,
    type: OrderLogType.CONFIRMED,
    memberId: sellerId,
    customerId: buyerId,
    orderStatus: status,
    toMemberId: toMemberId,
  });

  await log.save().then((log) => {
    orderService.updateLogToOrder({ order, log });
  });
});

// Gửi thông báo đơn hàng đang làm món cho khách hàng
onConfirmedOrder.subscribe(async (order) => {
  if (order.status != OrderStatus.CONFIRMED) return;
  const message = await getOrderConfirmedNotifyMessage(order);
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

// Publish order stream
onConfirmedOrder.subscribe(async (order) => {
  pubsub.publish("order", order);
});

// Gửi trigger
onConfirmedOrder.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:confirmed", sellerId, order);
});

async function getOrderConfirmedNotifyMessage(order: IOrder, forStaff = false) {
  const defaultMsg = `Món ăn đang được chuẩn bị.`;
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const orderConfirmedMsg = _.get(shopConfig, "notifyConfig.orderConfirmed", defaultMsg);
  const orderConfirmedMsgForStaff = _.get(
    shopConfig,
    "notifyConfig.orderConfirmedForStaff",
    defaultMsg
  );
  const message = forStaff ? orderConfirmedMsgForStaff : orderConfirmedMsg;
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}

// Thông báo SMS tới khách hàng
onConfirmedOrder.subscribe(async (order) => {
  const [seller, smsTemplate, shopConfig] = await Promise.all([
    MemberLoader.load(order.sellerId),
    SettingHelper.load(SettingKey.SMS_ORDER_CONFIRMED),
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
