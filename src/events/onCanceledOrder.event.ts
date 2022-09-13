import _ from "lodash";
import { Subject } from "rxjs";
import { configs } from "../configs";

import { SettingKey } from "../configs/settingData";
import { CustomerLoader } from "../graphql/modules/customer/customer.model";
import { MemberLoader } from "../graphql/modules/member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../graphql/modules/notification/notification.model";
import { IOrder } from "../graphql/modules/order/order.model";
import { orderService } from "../graphql/modules/order/order.service";
import { OrderItemLoader } from "../graphql/modules/orderItem/orderItem.model";
import { OrderLogModel, OrderLogType } from "../graphql/modules/orderLog/orderLog.model";
import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import { IShopConfig } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { staffService } from "../graphql/modules/staff/staff.service";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import { UserModel } from "../graphql/modules/user/user.model";
import { UtilsHelper } from "../helpers";
import esms from "../helpers/esms";
import { pubsub } from "../helpers/pubsub";
import LocalBroker from "../services/broker";
import { onApprovedFailureOrder } from "./onApprovedFailureOrder.event";
import { onSendChatBotText } from "./onSendToChatbot.event";

export const onCanceledOrder = new Subject<IOrder>();

// Gửi thông báo tới khách hàng
onCanceledOrder.subscribe(async (order) => {
  const [seller, customer, orderItems] = await Promise.all([
    MemberLoader.load(order.fromMemberId),
    CustomerLoader.load(order.buyerId),
    OrderItemLoader.loadMany(order.itemIds),
  ]);
  const pageAccount = customer.pageAccounts.find((p) => p.pageId == seller.fanpageId);
  if (pageAccount) {
    if (order.isPrimary) {
      // Đơn hàng của Mobifone
      SettingHelper.load(SettingKey.ORDER_CANCELED_CUSTOMER_MOBI_MSG).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: [pageAccount.psid],
          message: msg,
          context: { seller, orderItems, order },
        });
      });
    } else {
      // Đơn hàng của chủ shop
      SettingHelper.load(SettingKey.ORDER_CANCELED_CUSTOMER_MSG).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: [pageAccount.psid],
          message: msg,
          context: { seller, orderItems, order },
        });
      });
    }
  }
});

// Gửi thông báo tới chủ shop
onCanceledOrder.subscribe(async (order) => {
  const [seller, orderItems] = await Promise.all([
    MemberLoader.load(order.fromMemberId),
    OrderItemLoader.loadMany(order.itemIds),
  ]);
  if (order.isPrimary || order.sellerId.toString() != order.fromMemberId.toString()) {
    // Đơn hàng của Mobifone hoặc bán chéo
    SettingHelper.load(SettingKey.ORDER_CANCELED_SELLER_CROSSSALE_MSG).then((msg) => {
      onSendChatBotText.next({
        apiKey: seller.chatbotKey,
        psids: seller.psids,
        message: msg,
        context: { seller, orderItems, order },
      });
    });
  } else {
    // Đơn hàng tự bán
    SettingHelper.load(SettingKey.ORDER_CANCELED_SELLER_MSG).then((msg) => {
      onSendChatBotText.next({
        apiKey: seller.chatbotKey,
        psids: seller.psids,
        message: msg,
        context: { seller, orderItems, order },
      });
    });
  }
});

// Gửi thông báo tới quản trị viên Mobifone
onCanceledOrder.subscribe(async (order) => {
  if (!order.isPrimary) return;
  const [seller, orderItems, apiKey, msg, users] = await Promise.all([
    MemberLoader.load(order.fromMemberId),
    OrderItemLoader.loadMany(order.itemIds),
    SettingHelper.load(SettingKey.CHATBOT_API_KEY),
    SettingHelper.load(SettingKey.ORDER_CANCELED_SELLER_CROSSSALE_MSG),
    UserModel.find({ psid: { $exists: true } }),
  ]);
  onSendChatBotText.next({
    apiKey: apiKey,
    psids: users.map((u) => u.psid),
    message: msg,
    context: { seller, orderItems, order },
  });
});

onCanceledOrder.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, id, status, toMemberId } = order;

  const log = new OrderLogModel({
    orderId: id,
    type: OrderLogType.MEMBER_CANCELED,
    memberId: sellerId,
    customerId: buyerId,
    orderStatus: status,
  });

  if (toMemberId) {
    log.toMemberId = toMemberId;
  }

  await log.save().then((log) => {
    orderService.updateLogToOrder({ order, log });
  });
});

// Thông báo khách hàng cập nhật trạng thái giao hàng
onCanceledOrder.subscribe(async (order) => {
  const message = await getOrderCanceledNotifyMessage(order);
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

// Thông báo nhân viên cập nhật trang thái giao hàng
onCanceledOrder.subscribe(async (order) => {
  const staffs = await staffService.getStaffByBranchAndScope(order.sellerId, order.shopBranchId);
  const message = await getOrderCanceledNotifyMessage(order, true);
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

// Thông báo chủ shop cập nhật trạng thái giao hàng
onCanceledOrder.subscribe(async (order) => {
  const message = await getOrderCanceledNotifyMessage(order, true);
  const notify = new NotificationModel({
    target: NotificationTarget.MEMBER,
    type: NotificationType.ORDER,
    staffId: order.sellerId,
    title: `Đơn hàng #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Publish order stream
onCanceledOrder.subscribe(async (order) => {
  pubsub.publish("order", order);
});
onApprovedFailureOrder.subscribe(async (order) => {
  pubsub.publish("order", order);
});
// Gửi trigger
onApprovedFailureOrder.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:canceled", sellerId, order);
});

onCanceledOrder.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:canceled", sellerId, order);
});

async function getOrderCanceledNotifyMessage(order: IOrder, forStaff = false) {
  const defaultMsg = `Đơn hàng bị huỷ. ${order.note}`;
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const orderCanceledMsg = _.get(shopConfig, "notifyConfig.orderCanceled", defaultMsg);
  const orderCanceledMsgForStaffMsg = _.get(
    shopConfig,
    "notifyConfig.orderCanceledForStaff",
    defaultMsg
  );
  const message = forStaff ? orderCanceledMsgForStaffMsg : orderCanceledMsg;
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}

// Thông báo SMS tới khách hàng
onCanceledOrder.subscribe(async (order) => {
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
