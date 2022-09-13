import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export enum RewardPointLogType {
  RECEIVE_FROM_ORDER = "RECEIVE_FROM_ORDER", // Nhận từ đơn hàng
  USE_FOR_ORDER = "USE_FOR_ORDER", // Sử dụng cho đơn hàng
}

export type IRewardPointLog = BaseDocument & {
  memberId?: string; // Mã chủ shop
  customerId?: string; // Mã khách hàng
  type?: string; // Loại điểm
  value?: number; // Giá trị
  meta?: any; // Đữ liệu kèm theo
};

const rewardPointLogSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    customerId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: Object.values(RewardPointLogType), required: true },
    value: { type: Number, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

rewardPointLogSchema.index({ memberId: 1, customerId: 1 });
// rewardPointLogSchema.index({ name: "text" }, { weights: { name: 2 } });

export const RewardPointLogHook = new ModelHook<IRewardPointLog>(rewardPointLogSchema);
export const RewardPointLogModel: mongoose.Model<IRewardPointLog> = MainConnection.model(
  "RewardPointLog",
  rewardPointLogSchema
);

export const RewardPointLogLoader = ModelLoader<IRewardPointLog>(
  RewardPointLogModel,
  RewardPointLogHook
);
