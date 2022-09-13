import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum CustomerContactStatus {
  pending = "pending", // Đang chờ xem
  completed = "completed", // Đã xử lý
}
export type ICustomerContact = BaseDocument & {
  name?: string; // Họ tên
  companyName?: string; // Tên doanh nghiệp
  phone?: string; // Điên thoại
  email?: string; // Email
  address?: string; // Địa chỉ
  message?: string; // Nội dung
  status?: CustomerContactStatus; // Trang thái
};

const customerContactSchema = new Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    message: { type: String },
    status: {
      type: String,
      enum: Object.values(CustomerContactStatus),
      default: CustomerContactStatus.pending,
    },
  },
  { timestamps: true }
);

customerContactSchema.index(
  { name: "text", companyName: "text", phone: "text" },
  { weights: { name: 2, companyName: 2, phone: 2 } }
);

export const CustomerContactHook = new ModelHook<ICustomerContact>(customerContactSchema);
export const CustomerContactModel: mongoose.Model<ICustomerContact> = MainConnection.model(
  "CustomerContact",
  customerContactSchema
);

export const CustomerContactLoader = ModelLoader<ICustomerContact>(
  CustomerContactModel,
  CustomerContactHook
);
