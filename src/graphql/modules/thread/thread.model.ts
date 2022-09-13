import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { ThreadChannel, ThreadStatus } from "./thread.type";
const Schema = mongoose.Schema;
export type IThread = BaseDocument & {
  channel?: ThreadChannel; // Kênh trao đổi
  snippet?: string; // Tin nhắn gần nhất
  lastMessageAt?: Date; // Thời điểm tin nhắn gần nhất
  messageId?: string; // Mã tin nhắn gần nhất
  memberId?: string; // Mã chủ shop
  customerId?: string; // Mã khách hàng
  userId?: string; // Mã quản lý
  status?: ThreadStatus; // Trạng thái trao đổi
  seen?: boolean; // Đã xem
  seenAt?: Date; // Ngày xem gần nhất
  threadLabelIds?: string; // Danh sách Mã nhãn
};

const threadSchema = new Schema(
  {
    channel: { type: String, enum: Object.values(ThreadChannel), required: true },
    snippet: { type: String, default: "" },
    lastMessageAt: { type: Date },
    messageId: { type: Schema.Types.ObjectId },
    memberId: { type: Schema.Types.ObjectId },
    customerId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(ThreadStatus), default: ThreadStatus.new },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
    threadLabelIds: { type: [{ type: Schema.Types.ObjectId, ref: "ThreadLabel" }], default: [] },
  },
  { timestamps: true }
);

threadSchema.index({ memberId: 1 });
threadSchema.index({ customerId: 1 });
threadSchema.index({ userId: 1 });
threadSchema.index({ snippet: "text" }, { weights: { snippet: 2 } });

export const ThreadHook = new ModelHook<IThread>(threadSchema);
export const ThreadModel: mongoose.Model<IThread> = MainConnection.model("Thread", threadSchema);

export const ThreadLoader = ModelLoader<IThread>(ThreadModel, ThreadHook);
