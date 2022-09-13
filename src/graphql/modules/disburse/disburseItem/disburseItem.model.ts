import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export enum DisburseItemStatus {
  pending = "pending", // Đang xử lý
  completed = "completed", // Hoàn thành
  failed = "failed", // Thất bại
}
export type IDisburseItem = BaseDocument & {
  disburseId?: string; // Mã giải ngân
  memberId?: string; // Mã chủ shop
  customerId?: string; // Mã khách hàng
  customerCode?: string; // Mã chủ shop
  customerPhone?: string; // Điện thoại chủ shop
  customerName?: string; // Tên chủ shop
  idCard?: string; // CMND
  value?: number; // Giá trị giải ngân
  status?: DisburseItemStatus; // Trạng thái
  meta?: any; // Dữ liệu kèm theo
  payoutId?: string; // Mã đợt chi
};

const disburseItemSchema = new Schema(
  {
    disburseId: { type: Schema.Types.ObjectId, required: true },
    memberId: { type: Schema.Types.ObjectId, required: true },
    customerId: { type: Schema.Types.ObjectId, required: true },
    customerCode: { type: String },
    customerPhone: { type: String },
    customerName: { type: String },
    idCard: { type: String },
    value: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(DisburseItemStatus),
      default: DisburseItemStatus.pending,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
    payoutId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

disburseItemSchema.index({ disburseId: 1 });
disburseItemSchema.index(
  { memberCode: "text", memberPhone: "text" },
  { weights: { memberCode: 2, memberPhone: 2 } }
);

export const DisburseItemHook = new ModelHook<IDisburseItem>(disburseItemSchema);
export const DisburseItemModel: mongoose.Model<IDisburseItem> = MainConnection.model(
  "DisburseItem",
  disburseItemSchema
);

export const DisburseItemLoader = ModelLoader<IDisburseItem>(DisburseItemModel, DisburseItemHook);
