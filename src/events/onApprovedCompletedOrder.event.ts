import _ from "lodash";
import { Subject } from "rxjs";

import { SettingKey } from "../configs/settingData";
import { CollaboratorModel } from "../graphql/modules/collaborator/collaborator.model";
import { CommissionLogType } from "../graphql/modules/commissionLog/commissionLog.model";
import { CommissionMobifoneLogType } from "../graphql/modules/commissionMobifoneLog/commissionMobifoneLog.model";
import { CumulativePointLogType } from "../graphql/modules/cumulativePointLog/cumulativePointLog.model";
import { CustomerLoader, ICustomer } from "../graphql/modules/customer/customer.model";
import { RewardPointLogStats } from "../graphql/modules/customer/rewardPointLog/loaders/rewardPointLogStats";
import { RewardPointLogBuilder } from "../graphql/modules/customer/rewardPointLog/rewardPointLogBuilder";
import { CustomerPointLogType } from "../graphql/modules/customerPointLog/customerPointLog.model";
import { IMember, MemberLoader, MemberModel } from "../graphql/modules/member/member.model";
import {
  INotification,
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../graphql/modules/notification/notification.model";
import { NotificationBuilder } from "../graphql/modules/notification/notificationBuilder";
import { IOrder, OrderStatus } from "../graphql/modules/order/order.model";
import { orderService } from "../graphql/modules/order/order.service";
import { OrderItemLoader } from "../graphql/modules/orderItem/orderItem.model";
import { OrderLogModel, OrderLogType } from "../graphql/modules/orderLog/orderLog.model";
import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import { ShopConfigModel } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { staffService } from "../graphql/modules/staff/staff.service";
import { triggerService } from "../graphql/modules/trigger/trigger.service";
import { UserModel } from "../graphql/modules/user/user.model";
import esms from "../helpers/esms";
import { pubsub } from "../helpers/pubsub";
import { TokenHelper } from "../helpers/token.helper";
import { UtilsHelper } from "../helpers/utils.helper";
import LocalBroker from "../services/broker";
import { EventHelper } from "./event.helper";
import { onSendChatBotText } from "./onSendToChatbot.event";

export const onApprovedCompletedOrder = new Subject<IOrder>();

// duy???t ????n th??nh c??ng
// g???i cho ch??? c???a h??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const { buyerId, sellerId, itemIds, isPrimary } = order;
  if (!isPrimary) {
    const [seller, customer, orderItems] = await Promise.all([
      MemberLoader.load(sellerId),
      CustomerLoader.load(buyerId),
      OrderItemLoader.loadMany(itemIds),
    ]);
    const pageAccount = customer.pageAccounts.find((p) => p.pageId == seller.fanpageId);
    if (pageAccount) {
      // ????n h??ng c???a c???a h??ng
      SettingHelper.load(SettingKey.ORDER_COMPLETED_MSG_FOR_SHOPPER).then((msg) => {
        onSendChatBotText.next({
          apiKey: seller.chatbotKey,
          psids: seller.psids,
          message: msg,
          context: { seller, orderItems, order },
        });
      });
    }
  }
});

// duy???t ????n th??nh c??ng
// g???i cho kh??ch h??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const { buyerId, fromMemberId, itemIds, buyerBonusPoint, collaboratorId } = order;

  const collaborator = await CollaboratorModel.findById(collaboratorId);

  const [seller, customer, orderItems] = await Promise.all([
    MemberLoader.load(fromMemberId),
    CustomerLoader.load(buyerId),
    OrderItemLoader.loadMany(itemIds),
  ]);

  let cumulativePointCustomer: ICustomer = null;
  // ??i???m th?????ng cho kh??ch h??ng
  if (collaborator) {
    if (collaborator.customerId === customer.id) {
      if (buyerBonusPoint) {
        if (buyerBonusPoint > 0)
          [, cumulativePointCustomer] = await EventHelper.payCustomerPoint({
            customerId: customer.id,
            id: order._id,
            type: CustomerPointLogType.RECEIVE_FROM_ORDER,
            buyerBonusPoint,
          });
      }
    }
  }
  const pageAccount = customer.pageAccounts.find((p) => p.pageId == seller.fanpageId);
  if (pageAccount) {
    // ????n h??ng c???a ch??? shop
    SettingHelper.load(SettingKey.ORDER_COMPLETED_MSG_FOR_CUSTOMER).then((msg) => {
      onSendChatBotText.next({
        apiKey: seller.chatbotKey,
        psids: [pageAccount.psid],
        message: msg,
        context: {
          seller,
          orderItems,
          order,
          point: buyerBonusPoint,
          myPoint: buyerBonusPoint ? cumulativePointCustomer.cumulativePoint : null,
        },
      });
    });
  }
});

// duy???t ????n th??nh c??ng
// t??nh hoa h???ng mobifone - f0 - commission0
// g???i cho mobiphone khi
onApprovedCompletedOrder.subscribe(async (order) => {
  const { buyerId, fromMemberId, itemIds, commission0 } = order;
  //   console.log("order", order);
  const postOrderEnabled = SettingHelper.load(SettingKey.POST_CREATE_ORDER_ALERT_ENABLED);
  if (postOrderEnabled) {
    if (order.isPrimary) {
      const [seller, customer, orderItems, users, apiKey] = await Promise.all([
        MemberLoader.load(fromMemberId),
        CustomerLoader.load(buyerId),
        OrderItemLoader.loadMany(itemIds),
        UserModel.find({ psid: { $exists: true } }),
        SettingHelper.load(SettingKey.CHATBOT_API_KEY),
      ]);

      // hoa h???ng mobiphone
      if (commission0 > 0) {
        await EventHelper.payMobifoneCommission({
          type: CommissionMobifoneLogType.RECEIVE_COMMISSION_0_FROM_ORDER,
          commission: commission0,
          id: order._id,
        });
      }

      // ????n h??ng mobi
      const pageAccount = customer.pageAccounts.find((p) => p.pageId == seller.fanpageId);
      if (pageAccount) {
        // ????n h??ng c???a Mobifone
        SettingHelper.load(SettingKey.ORDER_COMPLETED_MSG_FOR_MOBIPHONE).then((msg) => {
          onSendChatBotText.next({
            apiKey: apiKey,
            psids: users.map((u) => u.psid),
            message: msg,
            context: { seller, orderItems, order, commission: commission0 },
          });
        });
      }
    }
  }
});

// duy???t ????n h??ng th??nh c??ng
// t??nh Hoa h???ng ??i???m b??n - f1 - commission1
// g???i cho c???a h??ng b??n ch??o
onApprovedCompletedOrder.subscribe(async (order) => {
  const { fromMemberId, itemIds, commission1, sellerBonusPoint, sellerId } = order;

  const [fromSeller, orderItems] = await Promise.all([
    MemberModel.findById(fromMemberId),
    OrderItemLoader.loadMany(itemIds),
  ]);

  let commissionUpdating: IMember = null;

  // console.log("commission1", commission1);
  // Hoa h???ng ??i???m b??n
  if (commission1) {
    if (commission1 > 0) {
      [, commissionUpdating] = await EventHelper.payCommission({
        memberId: fromSeller._id,
        type: CommissionLogType.RECEIVE_COMMISSION_1_FROM_ORDER,
        currentCommission: fromSeller.commission,
        commission: commission1,
        id: order._id,
      });
    }
  }

  let cummulativeUpdating: IMember = null;
  // ??i???m th?????ng ??i???m b??n
  if (sellerBonusPoint && sellerBonusPoint > 0) {
    [, cummulativeUpdating] = await EventHelper.paySellerPoint({
      id: order._id,
      sellerId: fromSeller._id,
      type: CumulativePointLogType.RECEIVE_FROM_ORDER,
      sellerBonusPoint,
    });
  }

  if (fromSeller) {
    SettingHelper.load(SettingKey.ORDER_COMPLETED_MSG_FOR_CROSSALE_SHOPPER).then((msg) => {
      const params = {
        apiKey: fromSeller.chatbotKey,
        psids: fromSeller.psids,
        message: msg,
        context: {
          seller: fromSeller,
          orderItems,
          order,
          commission: commission1,
          myCommission: commission1 ? commissionUpdating.commission : null,
          point: sellerBonusPoint,
          myPoint: sellerBonusPoint ? cummulativeUpdating.cumulativePoint : null,
        },
      };
      onSendChatBotText.next(params);
    });
  }
});

// duy???t ????n h??ng th??nh c??ng
// T??nh chi???t kh???u d??nh cho kho giao h??ng  - f3 - commission3
// G???i mess cho ng?????i gi???i thi???u
onApprovedCompletedOrder.subscribe(async (order) => {
  const { commission3, id, toMemberId, sellerId, code } = order;
  if (commission3 <= 0) return;
  const [seller, toMember] = await Promise.all([
    MemberModel.findById(sellerId),
    MemberModel.findById(toMemberId || sellerId),
  ]);
  if (!seller || !toMember) return;
  const commissionResult = await EventHelper.payCommission({
    memberId: toMember._id,
    type: CommissionLogType.RECEIVE_COMMISSION_3_FROM_ORDER,
    currentCommission: toMember.commission,
    commission: commission3,
    id,
  });

  const [, receiver] = commissionResult;
  if (toMember.psids) {
    SettingHelper.load(SettingKey.ORDER_COMMISSION_MSG_FOR_PRESENTER).then((msg) => {
      const params = {
        apiKey: toMember.chatbotKey,
        psids: toMember.psids,
        message: msg,
        context: {
          shopper: seller,
          code,
          commission: commission3,
          myCommission: commission3 ? receiver.commission : null,
        },
      };
      onSendChatBotText.next(params);
    });
  }
});

// Ghi log
onApprovedCompletedOrder.subscribe(async (order: IOrder) => {
  const { buyerId, sellerId, id, status, toMemberId } = order;

  if (status === OrderStatus.COMPLETED) {
    const log = new OrderLogModel({
      orderId: id,
      type: OrderLogType.MEMBER_COMPLETED,
      memberId: sellerId,
      customerId: buyerId,
      orderStatus: status,
    });

    if (toMemberId) {
      log.toMemberId = toMemberId;
      log.type = OrderLogType.TO_MEMBER_COMPLETED;
    }

    await log.save().then((log) => {
      orderService.updateLogToOrder({ order, log });
    });
  }
});

// Th??ng b??o ????n th??nh c??ng t???i kh??ch h??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const message = await getOrderCompletedNotifyMessage(order);

  const notify = new NotificationModel({
    target: NotificationTarget.CUSTOMER,
    type: NotificationType.ORDER,
    customerId: order.buyerId,
    title: `????n h??ng #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Th??ng b??o nh??n vi??n ????n h??ng th??nh c??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const staffs = await staffService.getStaffByBranchAndScope(order.sellerId, order.shopBranchId);
  const message = await getOrderCompletedNotifyMessage(order, true);
  const notifies = staffs.map(
    (s) =>
      new NotificationModel({
        target: NotificationTarget.STAFF,
        type: NotificationType.ORDER,
        staffId: s._id,
        title: `????n h??ng #${order.code}`,
        body: message,
        orderId: order._id,
      })
  );
  if (notifies.length > 0) {
    InsertNotification(notifies);
  }
});

// Th??ng b??o ch??? shop ????n h??ng th??nh c??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const message = await getOrderCompletedNotifyMessage(order, true);
  const notify = new NotificationModel({
    target: NotificationTarget.MEMBER,
    type: NotificationType.ORDER,
    staffId: order.sellerId,
    title: `????n h??ng #${order.code}`,
    body: message,
    orderId: order._id,
  });
  InsertNotification([notify]);
});

// Publish order stream
onApprovedCompletedOrder.subscribe(async (order) => {
  pubsub.publish("order", order);
});

// G???i trigger
onApprovedCompletedOrder.subscribe(async (order) => {
  const { sellerId } = order;
  triggerService.emitEvent("order:completed", sellerId, order);
});

// Th??ng b??o SMS t???i kh??ch h??ng
onApprovedCompletedOrder.subscribe(async (order) => {
  const [seller, buyer, smsTemplate, webappDomain, shopConfig] = await Promise.all([
    MemberLoader.load(order.sellerId),
    CustomerLoader.load(order.buyerId),
    SettingHelper.load(SettingKey.SMS_ORDER_COMPLETED),
    SettingHelper.load(SettingKey.WEBAPP_DOMAIN),
    ShopConfigModel.findOne({ memberId: order.sellerId }),
  ]);
  // const featureSms = _.get(shopConfig, "features.sms", false);
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

onApprovedCompletedOrder.subscribe(async (order) => {
  LocalBroker.emit("order.completed", { orderId: order._id.toString() });
});

// Ghi nh???n ??i???m th?????ng
onApprovedCompletedOrder.subscribe(async (order) => {
  let { rewardPoint, buyerId } = order;
  if (rewardPoint == 0) return;

  const rewardPointLog = RewardPointLogBuilder.receiveFromOrder(order);
  await rewardPointLog.save();
  RewardPointLogStats.loader.clear(buyerId.toString());
  const notifies: INotification[] = [];
  const title = `????n h??ng #${order.code}`;
  const message = await getOrderRewardPointNotifyMessage(order);
  // G???i th??ng b??o t???i ng?????i d??ng
  notifies.push(
    new NotificationBuilder(title, message)
      .order(order._id)
      .sendTo(NotificationTarget.CUSTOMER, order.buyerId)
      .build()
  );
  await InsertNotification(notifies);
});
async function getOrderCompletedNotifyMessage(order: IOrder, forStaff = false) {
  const defaultMsg = "????n h??ng ho??n th??nh.";
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const orderComletedMsg = _.get(shopConfig, "notifyConfig.orderCompleted", defaultMsg);
  const orderComletedMsgForStaff = _.get(
    shopConfig,
    "notifyConfig.orderCompletedForStaff",
    defaultMsg
  );
  const message = forStaff ? orderComletedMsgForStaff : orderComletedMsg;
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}

async function getOrderRewardPointNotifyMessage(order: IOrder, useDefault = false) {
  const defaultMsg = `Nh???n ??i???m th?????ng. S??? ??i???m: ${UtilsHelper.toMoney(order.rewardPoint)}`;
  if (useDefault) return defaultMsg;
  const shopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });

  const message = _.get(shopConfig, "notifyConfig.orderRewardPoint", defaultMsg);
  return UtilsHelper.parseStringWithInfo({ data: message, info: { order } });
}
