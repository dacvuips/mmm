import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { OrderStatus } from "../order/order.model";
const Schema = mongoose.Schema;

export enum OrderLogType {
  CREATED = "CREATED", // Khách hàng đặt đơn hàng
  CONFIRMED = "CONFIRMED", // Xác nhận nhận đơn hàng
  TRANSFERED = "TRANSFERED", // Chuyển đơn cho cửa hàng khác

  CUSTOMER_CANCELED = "CUSTOMER_CANCELED", // Khách hàng huỷ đơn
  MEMBER_CANCELED = "MEMBER_CANCELED", // Cửa hàng huỷ đơn

  MEMBER_DELIVERING = "MEMBER_DELIVERING", // Cửa hàng đổi trạng thái Đơn hàng giao
  MEMBER_COMPLETED = "MEMBER_COMPLETED", // Cửa hàng đổi trạng thái Đơn hàng thành công
  MEMBER_FAILURE = "MEMBER_FAILURE", // Cửa hàng đổi trạng thái Đơn hàng thất bại

  TO_MEMBER_DELIVERING = "TO_MEMBER_DELIVERING", // Cửa hàng giao hàng đổi trạng thái Đơn hàng giao
  TO_MEMBER_COMPLETED = "TO_MEMBER_COMPLETED", // Cửa hàng giao hàng đổi trạng thái Đơn hàng thành công
  TO_MEMBER_FAILURE = "TO_MEMBER_FAILURE", // Cửa hàng giao hàng đổi trạng thái Đơn hàng thất bại
}

export type IOrderLog = BaseDocument & {
  orderId?: string; // Mã đơn hàng
  type?: OrderLogType; // Loại lịch sử
  memberId?: string; // Mã người dùng
  toMemberId?: string; //Ma buu cuc chuyen giao
  customerId?: string; // Mã khách hàng
  orderStatus?: OrderStatus; // Trạng thái thanh toán
};

const orderLogSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    type: { type: String, enum: Object.values(OrderLogType), required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    toMemberId: { type: Schema.Types.ObjectId, ref: "Member" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    orderStatus: { type: String, enum: Object.values(OrderStatus) },
    value: { type: Number },
  },
  { timestamps: true }
);
orderLogSchema.index({ memberId: 1, createdAt: 1 });
// orderLogSchema.index({ name: "text" }, { weights: { name: 2 } });

export const OrderLogHook = new ModelHook<IOrderLog>(orderLogSchema);
export const OrderLogModel: mongoose.Model<IOrderLog> = MainConnection.model(
  "OrderLog",
  orderLogSchema
);

export const OrderLogLoader = ModelLoader<IOrderLog>(OrderLogModel, OrderLogHook);
