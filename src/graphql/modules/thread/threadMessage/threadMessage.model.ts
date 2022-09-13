import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
import { ThreadMessageType } from "./threadMessage.type";
import { ThreadSender, ThreadSenderSchema } from "./threadSender.graphql";
const Schema = mongoose.Schema;

export type IThreadMessage = BaseDocument & {
  threadId?: string; // Mã cuộc trao đổi
  type?: ThreadMessageType; // Loại tin nhắn
  text?: string; // Tin nhắn
  attachment?: any; // Dữ liệu đính kèm
  sender?: ThreadSender; // Người gửi
  seen?: boolean; // Đã xem
  seenAt?: Date; // Ngày xem
  isUnsend?: boolean; // Đã thu hồi
};

const threadMessageSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, default: "general" },
    text: { type: String },
    attachment: { type: Schema.Types.Mixed, default: {} },
    sender: { type: ThreadSenderSchema, required: true },
    seen: { type: Boolean, default: false },
    seenAt: { type: String },
    isUnsend: { type: Boolean, default: false },
  },
  { timestamps: true }
);

threadMessageSchema.index({ threadId: 1, createdAt: 1 });
// threadMessageSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ThreadMessageHook = new ModelHook<IThreadMessage>(threadMessageSchema);
export const ThreadMessageModel: mongoose.Model<IThreadMessage> = MainConnection.model(
  "ThreadMessage",
  threadMessageSchema
);

export const ThreadMessageLoader = ModelLoader<IThreadMessage>(
  ThreadMessageModel,
  ThreadMessageHook
);
