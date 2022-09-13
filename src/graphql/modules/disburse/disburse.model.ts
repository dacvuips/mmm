import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum DisburseStatus {
  opening = "opening", // Đang xử lý
  closed = "closed", // Đã đóng
}
export type IDisburse = BaseDocument & {
  memberId?: string; // Mã cửa hàng
  name?: string; // Đợt giải ngân
  startDate?: Date; // từ ngày
  endDate?: Date; // đến ngày
  status?: DisburseStatus; // Trạng thái
  note?: string; // Ghi chú
  ownerId?: string; // Người mở đợt giải ngân
  closeById?: string; // Người đóng đợt giải ngân
  closeAt?: Date; // Ngày đóng
};

const disburseSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(DisburseStatus), default: DisburseStatus.opening },
    note: { type: String },
    ownerId: { type: Schema.Types.ObjectId },
    closeById: { type: Schema.Types.ObjectId },
    closeAt: { type: Date },
  },
  { timestamps: true }
);

disburseSchema.index({ memberId: 1 });
disburseSchema.index({ name: "text" }, { weights: { name: 2 } });

export const DisburseHook = new ModelHook<IDisburse>(disburseSchema);
export const DisburseModel: mongoose.Model<IDisburse> = MainConnection.model(
  "Disburse",
  disburseSchema
);

export const DisburseLoader = ModelLoader<IDisburse>(DisburseModel, DisburseHook);
