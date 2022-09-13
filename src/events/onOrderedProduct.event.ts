import _ from "lodash";
import moment from "moment-timezone";
import { Subject } from "rxjs";

import { SettingKey } from "../configs/settingData";
import { CustomerLoader } from "../graphql/modules/customer/customer.model";
import { MemberLoader, MemberModel } from "../graphql/modules/member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../graphql/modules/notification/notification.model";
import { transferOrderToAhamove } from "../graphql/modules/order/ahamove/transferOrderToAhamove";
import { IOrder, OrderStatus, PickupMethod } from "../graphql/modules/order/order.model";
import { orderService } from "../graphql/modules/order/order.service";
import { OrderItemLoader } from "../graphql/modules/orderItem/orderItem.model";
import { OrderLogModel, OrderLogType } from "../graphql/modules/orderLog/orderLog.model";
import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import { IShopConfig } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { staffService } from "../graphql/modules/staff/staff.service";
import { TriggerModel } from "../graphql/modules/trigger/trigger.model";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import { UserModel } from "../graphql/modules/user/user.model";
import { UtilsHelper } from "../helpers";
import { pubsub } from "../helpers/pubsub";
import { logger } from "../loaders/logger";
import TransferOrderToAhamoveJob from "../scheduler/jobs/transferOrderToAhamove.job";
import LocalBroker from "../services/broker";
import { onSendChatBotText } from "./onSendToChatbot.event";

export const onOrderedProduct = new Subject<IOrder>();

// tạo đơn hàng thành công
// gửi cho chủ cửa hàng
onOrderedProduct.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, itemIds, isPrimary, code, buyerName, fromMemberId } = order;
  const [seller, customer, orderItems] = await Promise.all([
    MemberLoader.load(sellerId),
    CustomerLoader.load(buyerId),
    OrderItemLoader.loadMany(itemIds),
  ]);

  const pageAccount = customer.pageAccounts.find((p) => p.pageId == seller.fanpageId);
  if (pageAccount) {
    // Đơn hàng của của hàng
    SettingHelper.load(SettingKey.ORDER_PENDING_MSG_FOR_CUSTOMER).then((msg) => {
      onSendChatBotText.next({
        apiKey: seller.chatbotKey,
        psids: [pageAccount.psid],
        message: msg,
        context: { seller, orderItems, order },
      });
    });
  }

  const postOrderEnabled = await SettingHelper.load(SettingKey.POST_CREATE_ORDER_ALERT_ENABLED);

  // console.log('postOrderEnabled',postOrderEnabled);

  if (isPrimary) {
    if (postOrderEnabled) {
      const [apiKey, msg, users, orderItems] = await Promise.all([
        SettingHelper.load(SettingKey.CHATBOT_API_KEY),
        SettingHelper.load(SettingKey.ORDER_PENDING_MSG_FOR_MOBIFONE),
        UserModel.find({ psid: { $exists: true } }),
        OrderItemLoader.loadMany(order.itemIds),
      ]);

      onSendChatBotText.next({
        apiKey: apiKey,
        psids: users.map((u) => u.psid),
        message: msg,
        context: { order, orderItems },
      });
    }
  } else {
    if (fromMemberId.toString() === sellerId.toString()) {
      const [seller, orderItems] = await Promise.all([
        MemberLoader.load(sellerId),
        OrderItemLoader.loadMany(itemIds),
      ]);

      SettingHelper.load(SettingKey.ORDER_PENDING_MSG_FOR_SHOPPER).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: seller.psids,
          message: msg,
          context: { seller, orderItems, order },
        });
      });
    } else {
      const [seller, fromSeller, orderItems] = await Promise.all([
        MemberLoader.load(sellerId),
        MemberLoader.load(fromMemberId),
        OrderItemLoader.loadMany(itemIds),
      ]);
      SettingHelper.load(SettingKey.ORDER_PENDING_MSG_FOR_SHOPPER).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: seller.psids,
          message: msg,
          context: { seller, orderItems, order },
        });
      });
      SettingHelper.load(SettingKey.ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: seller.psids,
          message: msg,
          context: { seller: fromSeller, orderItems, order },
        });
      });
    }
  }
});

onOrderedProduct.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, id, status } = order;

  const log = new OrderLogModel({
    orderId: id,
    type: OrderLogType.CREATED,
    memberId: sellerId,
    customerId: buyerId,
    orderStatus: status,
  });

  await log.save().then((log) => {
    orderService.updateLogToOrder({ order, log });
  });
});

// Gửi thông báo tới nhân viên chi nhánh
onOrderedProduct.subscribe(async (order) => {
  if (order.status != OrderStatus.PENDING) return;
  const staffs = await staffService.getStaffByBranchAndScope(order.sellerId, order.shopBranchId);
  const message = await getOrderPendingNotifyMessage(order, true);
  const notifies = staffs.map(
    (s) =>
      new NotificationModel({
        target: NotificationTarget.STAFF,
        type: NotificationType.ORDER,
        staffId: s._id,
        title: `Đơn hàng mới #${order.code}`,
        body: message,
        orderId: order._id,
      })
  );
  if (notifies.length > 0) {
    InsertNotification(notifies);
  }
});

// Gửi thông báo tới chủ shop
onOrderedProduct.subscribe(async (order) => {
  if (order.status != OrderStatus.PENDING) return;
  const member = await MemberModel.findById(order.sellerId);
  const message = await getOrderPendingNotifyMessage(order, true);
  const notify = new NotificationModel({
    target: NotificationTarget.MEMBER,
    type: NotificationType.ORDER,
    memberId: member._id,
    title: `Đơn hàng mới #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Gửi thông báo tới khách hàng
onOrderedProduct.subscribe(async (order) => {
  if (order.status != OrderStatus.PENDING) return;
  const customer = await CustomerLoader.load(order.buyerId);
  const message = await getOrderPendingNotifyMessage(order);
  const notify = new NotificationModel({
    target: NotificationTarget.CUSTOMER,
    type: NotificationType.ORDER,
    customerId: customer._id,
    title: `Đơn hàng mới #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Publish order stream
onOrderedProduct.subscribe(async (order) => {
  pubsub.publish("order", order);
});

// Gửi trigger
onOrderedProduct.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:new", sellerId, order);
});

onOrderedProduct.subscribe(async (order) => {
  LocalBroker.emit("order.pending", { orderId: order._id.toString() });
});

async function getOrderPendingNotifyMessage(order: IOrder, forStaff = false) {
  const defaultMsg = `${order.itemCount} món - ${UtilsHelper.toMoney(order.amount)}`;
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const orderPendingMsg = _.get(shopConfig, "notifyConfig.orderPending", defaultMsg);
  const orderPendingMsgForStaff = _.get(
    shopConfig,
    "notifyConfig.orderPendingForStaff",
    defaultMsg
  );
  const message = forStaff ? orderPendingMsgForStaff : orderPendingMsg;
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}

// Xử lý đơn hàng chuyển nhanh
onOrderedProduct.subscribe(async (order) => {
  const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const {
    orderConfig: { ahamoveEnabled = true, ahamoveFastForward, ahamoveFastForwardDelay },
  } = shopConfig;

  if (order.pickupMethod != PickupMethod.DELIVERY) {
    logger.info("Phương thức nhận hàng ko phải giao hàng, bỏ qua");
    return;
  }
  if (!ahamoveEnabled || !ahamoveFastForward) {
    logger.info("Không có cấu hình giao hàng ahamove");
    // Không có cấu hình giao hàng ahamove
    // Hoặc không cấu hình giao hàng nhanh, bỏ qua
    return;
  }

  if (ahamoveFastForwardDelay == 0) {
    await transferOrderToAhamove(order);
  } else {
    logger.info(`Schedule Tự động chuyển ahamove sau ${ahamoveFastForwardDelay} phút`);
    await TransferOrderToAhamoveJob.create({ orderId: order._id })
      .schedule(moment().add(ahamoveFastForwardDelay, "minute").toDate())
      .save();
  }
});
