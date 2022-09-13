import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum EmailType {
  CUSTOM = "CUSTOM", // Tuỳ chỉnh
  PLAN_REMIND_EXPIRED = "PLAN_REMIND_EXPIRED", // Nhắc nhở dịch vụ sắp hết hạn
  PLAN_EXPIRED = "PLAN_EXPIRED", // Dịch vụ hết hạn
  PLAN_REMIND_STOP = "PLAN_REMIND_STOP", // Nhắc nhở ngắt dịch vụ
  PLAN_STOPED = "PLAN_STOPED", // Dịch vụ đã bị ngắt
}

export type IEmail = BaseDocument & {
  name?: string; // Tên mẫu email
  type?: EmailType; // Loại email
  subject?: string; // Tiêu đề email
  text?: string; // Nội dung text
  html?: string; // Nội dung html
  context?: any[]; // Dữ liệu context
  design?: any; // Data design
};

const emailSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(EmailType), default: EmailType.CUSTOM },
    subject: { type: String, required: true },
    text: { type: String },
    html: { type: String, required: true },
    context: { type: [Schema.Types.Mixed], default: [] },
    design: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

emailSchema.index({ name: "text" }, { weights: { name: 2 } });

export const EmailHook = new ModelHook<IEmail>(emailSchema);
export const EmailModel: mongoose.Model<IEmail> = MainConnection.model("Email", emailSchema);

export const EmailLoader = ModelLoader<IEmail>(EmailModel, EmailHook);
