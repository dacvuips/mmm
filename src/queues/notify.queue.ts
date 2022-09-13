import Queue, { Job } from "bee-queue";
import _ from "lodash";

import { deviceLoader } from "../batch/device.loader";
import { CustomerLoader, ICustomer } from "../graphql/modules/customer/customer.model";
import { DeviceInfoModel, IDeviceInfo } from "../graphql/modules/deviceInfo/deviceInfo.model";
import { MemberLoader } from "../graphql/modules/member/member.model";
import { NotificationHelper } from "../graphql/modules/notification/notification.helper";
import {
  INotification,
  NotificationModel,
  NotificationTarget,
} from "../graphql/modules/notification/notification.model";
import { IShopConfig } from "../graphql/modules/shop/shopConfig/shopConfig.model";
import { getZaloToken } from "../graphql/modules/shop/shopConfig/zalo/common";
import { ZaloConfigStatus } from "../graphql/modules/shop/shopConfig/zalo/zaloConfig.graphql";
import { StaffLoader } from "../graphql/modules/staff/staff.model";
import { firebaseHelper } from "../helpers";
import manychat from "../helpers/manychat";
import zalo from "../helpers/zalo";
import { ZaloMessageBuilder } from "../helpers/zalo/zaloMessageBuilder";
import { logger } from "../loaders/logger";
import LocalBroker from "../services/broker";
import { BaseQueue } from "./queue";

class NotifyQueue extends BaseQueue {
  constructor() {
    super("notify", 100);
  }
  protected async process(job: Job<INotification>) {
    console.log("process notify queue", job.id);
    switch (job.data.target) {
      case NotificationTarget.MEMBER:
        return await this.sendToMember(job.data);
      case NotificationTarget.STAFF:
        return await this.sendToStaff(job.data);
      case NotificationTarget.CUSTOMER:
        return await this.sendToCustomer(job.data);
    }
  }
  private async sendToMember(notify: INotification) {
    const memberId = notify.memberId.toString();
    const [member, devices] = await Promise.all([
      MemberLoader.load(memberId),
      deviceLoader.member.load(memberId),
    ]);
    if (!member || !devices || !devices.length) return;
    await this.sendNotificationToDevices(devices, [notify]);
    await this.updateNoficationCounter([notify._id]);
  }

  private async sendToCustomer(notify: INotification) {
    const customerId = notify.customerId.toString();
    const [customer, devices] = await Promise.all([
      CustomerLoader.load(customerId),
      deviceLoader.customer.load(customerId),
    ]);
    if (!customer) return;

    await this.sendNotificationToDevices(devices, [notify]);
    // await this.sendNotificationToManychat(notify, customer);
    // await this.sendNotificationToZalo(notify, customer);
    await this.updateNoficationCounter([notify._id]);
  }

  private async sendToStaff(notify: INotification) {
    const staffId = notify.staffId.toString();
    const [staff, devices] = await Promise.all([
      StaffLoader.load(staffId),
      deviceLoader.staff.load(staffId),
    ]);
    if (!staff || !devices || !devices.length) return;
    await this.sendNotificationToDevices(devices, [notify]);
    await this.updateNoficationCounter([notify._id]);
  }

  private async sendNotificationToZalo(notify: INotification, customer: ICustomer) {
    if (_.isEmpty(customer.followerId) == false) {
      // Có liên kết manychat
      const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
        id: customer.memberId.toString(),
      });
      const {
        zaloConfig: { active, status },
      } = shopConfig;
      if (active == false || status == ZaloConfigStatus.disconnect) {
        // Chưa kích hoạt hoặc chưa két nội manychat, bỏ qua
        return;
      }
      try {
        const { followerId } = customer;
        const token = await getZaloToken(shopConfig);
        const sendData = new ZaloMessageBuilder()
          .text(`${notify.title}\n============\n${notify.body}`)
          .send(followerId);
        await zalo.message(token, sendData);
      } catch (err) {
        logger.error(`lỗi khi gửi tin zalo`, err);
      }
    }
  }

  private async sendNotificationToManychat(notify: INotification, customer: ICustomer) {
    if (_.isEmpty(customer.manychatSubscriber?.id) == false) {
      // Có liên kết manychat
      const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
        id: customer.memberId.toString(),
      });
      const {
        manychatConfig: { active, pageInfo, apiKey, status },
      } = shopConfig;
      if (active == false || status == "disconnected") {
        // Chưa kích hoạt hoặc chưa két nội manychat, bỏ qua
        return;
      }
      if (pageInfo.id.toString() != customer.manychatSubscriber.page_id.toString()) {
        // Không cùng page, bỏ qua
        return;
      }
      const {
        manychatSubscriber: { id: subscriberId },
      } = customer;
      const sendData = manychat.sendDataBuilder
        .subscriber(subscriberId)
        .messages([
          manychat.messageBuilder.message(`${notify.title}\n============\n${notify.body}`).build(),
        ])
        .build();
      await manychat.send(apiKey, sendData);
    }
  }
  private async sendNotificationToDevices(devices: IDeviceInfo[], notifications: INotification[]) {
    const task: Promise<any>[] = [];
    if (devices && devices.length > 0) {
      // Gửi tin nhắn tới thiết bị
      for (const n of notifications as INotification[]) {
        const fcmData = new NotificationHelper(n).getFCMData();
        for (const d of devices) {
          task.push(
            firebaseHelper.messaging
              .send({ ...fcmData, token: d.deviceToken } as any)
              .catch((err) => {
                if (
                  err.message == "Requested entity was not found." ||
                  err.message == "SenderId mismatch"
                ) {
                  DeviceInfoModel.remove({ _id: d._id }).exec();
                } else {
                  console.log("firebase Error", err.message, d.deviceId);
                  // throw err;
                }
              })
          );
        }
      }
    }
    return await Promise.all(task);
  }
  private async updateNoficationCounter(notificationIds: string[]) {
    if (notificationIds.length > 0) {
      // Cập nhật tin nhắn đã gửi
      await NotificationModel.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { sentAt: new Date() } }
      ).exec();
    }
  }
}

export const notifyQueue = new NotifyQueue();
