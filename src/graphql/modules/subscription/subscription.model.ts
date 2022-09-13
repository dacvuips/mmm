import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum Plan {
  FREE = "FREE", // Miễn phí
  BASIC = "BASIC", // Gói cơ bản
  PROFESSIONAL = "PROFESSIONAL", // Gói chuyên nghiệp

  MONTH = "MONTH", // Tháng (Để tránh bị lỗi các gói cũ, không còn sử dụng)
  YEAR = "YEAR", // Năm (Để tránh bị lỗi các gói cũ, không còn sử dụng)
}
export enum SubscriptionPaymentStatus {
  PENDING = "PENDING", // Đang xử lý
  COMPLETE = "COMPLETE", // Hoàn thành
}
export type ISubscription = BaseDocument & {
  memberId?: string; // Mã chủ shop
  plan?: Plan; // Gói dịch vụ
  expiredAt?: Date; // Ngày hết hạn
  remindExpiredAt?: Date; // Ngày nhắc nhở hết hạn
  remindLockAt?: Date; // Ngày nhắc nhở khoá
  lockedAt?: Date; // Ngày khoá
  fee?: number; // Phí dịch vụ
  requestId?: string; // Mã yêu cầu đăng ký
};

export const SubscriptionSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    plan: { type: String, enum: Object.values(Plan), default: Plan.FREE },
    expiredAt: { type: Date, required: true },
    remindExpiredAt: { type: Date },
    remindLockAt: { type: Date },
    lockedAt: { type: Date },
    fee: { type: Number, default: 0, min: 0 },
    requestId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);
SubscriptionSchema.index({ memberId: 1 });
// subscriptionSchema.index({ name: "text" }, { weights: { name: 2 } });

export const SubscriptionHook = new ModelHook<ISubscription>(SubscriptionSchema);
export const SubscriptionModel: mongoose.Model<ISubscription> = MainConnection.model(
  "Subscription",
  SubscriptionSchema
);

export const SubscriptionLoader = ModelLoader<ISubscription>(SubscriptionModel, SubscriptionHook);
