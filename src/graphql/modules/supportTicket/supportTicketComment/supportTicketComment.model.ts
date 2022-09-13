import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
import { SupportTicketStatus, SupportTicketSubStatus } from "../common";
const Schema = mongoose.Schema;

export type ISupportTicketComment = BaseDocument & {
  ticketId?: string; // Mã yêu cầu
  fromMember?: boolean; // Bình luận từ chủ shop
  memberId?: string; // Mã chủ shop
  userId?: string; // Mã người dùng
  name?: string; // Tên
  message?: string; // Nội dung
  images?: string[]; // Hình ảnh
};

const supportTicketCommentSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, required: true },
    fromMember: { type: Boolean, required: true },
    memberId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    message: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

supportTicketCommentSchema.index({ ticketId: 1 });
// supportTicketCommentSchema.index({ name: "text" }, { weights: { name: 2 } });

export const SupportTicketCommentHook = new ModelHook<ISupportTicketComment>(
  supportTicketCommentSchema
);
export const SupportTicketCommentModel: mongoose.Model<ISupportTicketComment> = MainConnection.model(
  "SupportTicketComment",
  supportTicketCommentSchema
);

export const SupportTicketCommentLoader = ModelLoader<ISupportTicketComment>(
  SupportTicketCommentModel,
  SupportTicketCommentHook
);
