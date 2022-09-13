import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { notifyQueue } from "../../../queues/notify.queue";
import { logger } from "../../../loaders/logger";
import { pubsub } from "../../../helpers/pubsub";
const Schema = mongoose.Schema;
export enum NotificationType {
  MESSAGE = "MESSAGE", // Tin nhắn
  ORDER = "ORDER", // Đơn hàng
  PRODUCT = "PRODUCT", // Sản phẩm
  WEBSITE = "WEBSITE", // Website
  SUPPORT_TICKET = "SUPPORT_TICKET", // Yêu cầu hỗ trợ
}
export enum NotificationTarget {
  MEMBER = "MEMBER", // Gửi tới chủ shop
  STAFF = "STAFF", // Gưi tới staff
  CUSTOMER = "CUSTOMER", // Gửi tới khách hàng
  USER = "USER", // Tài khoản quản lý
}
export type INotification = BaseDocument & {
  target?: NotificationTarget; // Gửi tới
  userId?: string; // Mã người dùng
  memberId?: string; // Mã chủ shop
  staffId?: string; // Mã nhân viên
  customerId?: string; // Mã khách hàng
  title?: string; // Tiêu đề thông báo
  body?: string; // Nội dung thông báo
  type?: NotificationType; // Loại thông báo
  seen?: boolean; // Đã xem
  seenAt?: Date; // Ngày xem
  image?: string; // Hình ảnh
  sentAt?: Date; // Ngày gửi
  orderId?: string; // Mã đơn hàng
  productId?: string; // Mã sản phẩm
  link?: string; // Link website
  ticketId?: string; // Mã yêu cầu hỗ trợ
};

const notificationSchema = new Schema(
  {
    target: { type: String, enum: Object.values(NotificationTarget), required: true },
    userId: { type: Schema.Types.ObjectId },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    staffId: { type: Schema.Types.ObjectId, ref: "Staff" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
    image: { type: String },
    sentAt: { type: Date },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    link: { type: String },
    ticketId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, collation: { locale: "vi" } }
);

notificationSchema.index({ memberId: 1 });
notificationSchema.index({ staffId: 1 });
notificationSchema.index({ customerId: 1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ title: "text" }, { weights: { title: 2 } });
notificationSchema.index({ sentAt: 1 });

export const NotificationStackModel = MainConnection.model("NotificationStack", notificationSchema);

export const NotificationHook = new ModelHook<INotification>(notificationSchema);
export const NotificationModel: mongoose.Model<INotification> = MainConnection.model(
  "Notification",
  notificationSchema
);

export const NotificationLoader = ModelLoader<INotification>(NotificationModel, NotificationHook);

// NotificationHook.onSaved.subscribe((notification) => {
//   createNotifyJob([notification]);
// });

export function InsertNotification(notifies: INotification[]) {
  return Promise.all([
    NotificationModel.insertMany(notifies),
    createNotifyJob(notifies),
    pubsubNotify(notifies),
  ]);
}

async function createNotifyJob(notifies: INotification[]) {
  const tasks: Promise<any>[] = [];
  for (const notify of notifies) {
    tasks.push(notifyQueue.queue().createJob(notify).save());
  }
  return Promise.all(tasks);
}

async function pubsubNotify(notifies: INotification[]) {
  for (const notify of notifies) {
    pubsub.publish("notify", notify);
  }
}
