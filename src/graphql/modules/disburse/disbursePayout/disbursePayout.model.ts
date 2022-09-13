import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export enum DisbursePayoutStatus {
  processing = "processing", // Đang xử lý
  pending = "pending", // Chờ duyệt
  approved = "approved", // Đã duyệt chi
  denied = "denied", // Đã huỷ yêu cầu chi
  canceled = "canceled", // Đã huỷ
  error = "error", // Lỗi
}
export type IDisbursePayout = BaseDocument & {
  memberId?: string; // Mã cửa hàng
  disburseId?: string; // Mã đợt giải ngân
  ownerId?: string; // Người tạo
  approverId?: string; // Người duyệt
  approveAt?: Date; // Ngày duyệt hoặc Ngày huỷ
  name?: string; // Tên đợt chi
  amount?: number; // Tổng số tiền chi
  transactionCount?: number; // Số giao dịch
  successCount?: number; // Số giao dịch thành công
  successAmount?: number; // Số tiên chi thành công
  failedCount?: number; // Số giao dịch thất bại
  status?: DisbursePayoutStatus; // Trạng thái chi
  processingMsg?: string; // Nội dung đang xử lý
  meta?: any; // Dữ liệu kèm theo
};

const disbursePayoutSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    disburseId: { type: Schema.Types.ObjectId, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true },
    approverId: { type: Schema.Types.ObjectId },
    approveAt: { type: Date },
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    successAmount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(DisbursePayoutStatus),
      default: DisbursePayoutStatus.processing,
    },
    processingMsg: { type: String },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

disbursePayoutSchema.index({ disburseId: 1 });
disbursePayoutSchema.index({ name: "text" }, { weights: { name: 2 } });

export const DisbursePayoutHook = new ModelHook<IDisbursePayout>(disbursePayoutSchema);
export const DisbursePayoutModel: mongoose.Model<IDisbursePayout> = MainConnection.model(
  "DisbursePayout",
  disbursePayoutSchema
);

export const DisbursePayoutLoader = ModelLoader<IDisbursePayout>(
  DisbursePayoutModel,
  DisbursePayoutHook
);
