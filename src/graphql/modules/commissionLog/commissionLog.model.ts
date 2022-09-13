import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum CommissionLogType {
  RECEIVE_COMMISSION_1_FROM_ORDER = "RECEIVE_COMMISSION_1_FROM_ORDER", // Hoa hồng nhận từ đơn hàng dành cho Chủ shop
  RECEIVE_COMMISSION_2_FROM_ORDER_FOR_PRESENTER = "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_PRESENTER", // Hoa hồng nhận từ đơn hàng dành cho người giới thiệu Chủ shop
  RECEIVE_COMMISSION_2_FROM_ORDER_FOR_COLLABORATOR = "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_COLLABORATOR", // Hoa hồng ctv nhận từ đơn hàng cho chủ shop
  RECEIVE_COMMISSION_2_FROM_ORDER = "RECEIVE_COMMISSION_2_FROM_ORDER", // Hoa hồng giới thiệu nhận từ đơn hàng cho CTV
  RECEIVE_COMMISSION_3_FROM_ORDER = "RECEIVE_COMMISSION_3_FROM_ORDER", // Hoa hồng kho nhận từ đơn hàng cho chủ shop

  DISBURSE_COMMISSION_MANUAL = "DISBURSE_COMMISSION_MANUAL", // Hoa hồng đã chi thủ công từ chủ shop
  DISBURSE_COMMISSION_MOMO = "DISBURSE_COMMISSION_MOMO", // Hoa hồng đã chi qua momo từ chủ shop
}

export type ICommissionLog = BaseDocument & {
  memberId?: string; // Mã thành viên
  customerId?: string; // Mã khách hàng
  value?: number; // Giá trị
  type?: CommissionLogType; // Loại sự kiện
  orderId?: string; // Mã đơn hàng
  regisSMSId?: string; // Mã đăng ký SMS
  regisServiceId?: string; //Mã đăng ký dịch vụ
  disburseId?: string; // Mã đợt giải ngân
  disburseItemId?: string; // Mã chi
  content?: string; // nội dung chi
  attachments?: string[]; // hình ảnh gửi kèm
};

const commissionLogSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    value: { type: Number, required: true },
    type: { type: String, enum: Object.values(CommissionLogType), required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    regisSMSId: { type: Schema.Types.ObjectId, ref: "RegisSMS" },
    regisServiceId: { type: Schema.Types.ObjectId, ref: "RegisService" },
    disburseId: { type: Schema.Types.ObjectId },
    disburseItemId: { type: Schema.Types.ObjectId },
    content: { type: String },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

commissionLogSchema.index({ createdAt: 1, type: 1 });
commissionLogSchema.index({ memberId: 1 });
commissionLogSchema.index({ customerId: 1 });

commissionLogSchema.index(
  { customerId: 1, orderId: 1, type: 1 },
  { partialFilterExpression: { orderId: { $exists: true } }, unique: true }
);
// commissionLogSchema.index({ name: "text" }, { weights: { name: 2 } });

export const CommissionLogHook = new ModelHook<ICommissionLog>(commissionLogSchema);
export const CommissionLogModel: mongoose.Model<ICommissionLog> = MainConnection.model(
  "CommissionLog",
  commissionLogSchema
);

export const CommissionLogLoader = ModelLoader<ICommissionLog>(
  CommissionLogModel,
  CommissionLogHook
);
