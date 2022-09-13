import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { SupportTicketStatus, SupportTicketSubStatus } from "./common";
const Schema = mongoose.Schema;

export type ISupportTicket = BaseDocument & {
  code?: string; // Mã yêu cầu
  memberId?: string; // Mã chủ shop
  name?: string; // Nội dung yêu cầu
  desc?: string; // Mô tả chi tiết
  images?: string[]; // Danh sách hình ảnh
  status?: SupportTicketStatus; // Trạng thái xử lý
  subStatus?: SupportTicketSubStatus; // Chi tiết trạng thái
  logs?: any[]; // Lịch sử
  assignerId?: string; // Nhân sự phụ trách
};

const supportTicketSchema = new Schema(
  {
    code: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    desc: { type: String },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(SupportTicketStatus),
      default: SupportTicketStatus.opening,
    },
    subStatus: {
      type: String,
      enum: Object.values(SupportTicketSubStatus),
      default: SupportTicketSubStatus.new,
    },
    logs: { type: [Schema.Types.Mixed], default: [] },
    assignerId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

supportTicketSchema.index({ code: 1 }, { unique: true });
supportTicketSchema.index({ memberId: 1 });
supportTicketSchema.index({ name: "text", code: "text" }, { weights: { name: 2, code: 2 } });

export const SupportTicketHook = new ModelHook<ISupportTicket>(supportTicketSchema);
export const SupportTicketModel: mongoose.Model<ISupportTicket> = MainConnection.model(
  "SupportTicket",
  supportTicketSchema
);

export const SupportTicketLoader = ModelLoader<ISupportTicket>(
  SupportTicketModel,
  SupportTicketHook
);
