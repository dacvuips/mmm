import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
import { approvalStatus } from "../../../../../constants/approveStatus";
const Schema = mongoose.Schema;

export type IWithdrawRequest = BaseDocument & {
  memberId?: string; // Mã shop
  value?: number; // Giá trị
  status?: approvalStatus; // Trạng thái yêu cầu
  approvedAt?: Date; // Ngày duyệt
  rejectedAt?: Date; // Ngày từ chối
  rejectedReason?: string; // Lí do từ chối
  userId?: string; // Mã người duyệt
};

const withdrawRequestSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    value: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(approvalStatus),
      default: approvalStatus.PENDING,
    },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// withdrawRequestSchema.index({ name: "text" }, { weights: { name: 2 } });

export const WithdrawRequestHook = new ModelHook<IWithdrawRequest>(withdrawRequestSchema);
export const WithdrawRequestModel: mongoose.Model<IWithdrawRequest> = MainConnection.model(
  "WithdrawRequest",
  withdrawRequestSchema
);

export const WithdrawRequestLoader = ModelLoader<IWithdrawRequest>(
  WithdrawRequestModel,
  WithdrawRequestHook
);
