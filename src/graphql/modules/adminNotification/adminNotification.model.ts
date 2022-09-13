import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { Owner, OwnerSchema } from "../mixin/owner.graphql";
import { NotifySendLog, NotifySendLogSchema } from "./notifySendLog.graphql";
import { Action, ActionSchema } from "../mixin/action.graphql";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export type IAdminNotification = BaseDocument & {
  owner?: Owner; // Người tạo thông báo
  title?: string; // Tiêu đề
  body?: string; // Tin nhắn
  image?: string; // Hình ảnh
  logs?: NotifySendLog[]; // Lịch sử gửi
  action?: Action; // Hành động khi click
};

const adminNotificationSchema = new Schema(
  {
    owner: { type: OwnerSchema, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String },
    logs: { type: [NotifySendLogSchema], default: [] },
    action: { type: ActionSchema },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ title: "text" }, { weights: { title: 2 } });

export const AdminNotificationHook = new ModelHook<IAdminNotification>(adminNotificationSchema);
export const AdminNotificationModel: mongoose.Model<IAdminNotification> = MainConnection.model(
  "NotifyTemplate",
  adminNotificationSchema
);

export const NotifyTemplateLoader = ModelLoader<IAdminNotification>(
  AdminNotificationModel,
  AdminNotificationHook
);
