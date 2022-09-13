import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
import { Gender } from "../../member/member.model";
const Schema = mongoose.Schema;

export type IGlobalCustomer = BaseDocument & {
  uid?: string; // Mã UID Firebase
  code?: string; // Mã khách hàng
  name?: string; // Tên khách hàng

  phone?: string; // Số điện thoại
  email?: string; // Email

  avatar?: string; // Avatar
  gender?: Gender; // Giới tính
  birthday?: Date; // Ngày sinh

  fullAddress?: string; // Full địa chỉ
  latitude?: number;
  longitude?: number;
  context?: any; // Dữ liệu khách hàng

  signInProvider?: string; // Phương thức đăng nhập
  customerIds?: string[]; //danh sách customerid
};

const globalCustomerSchema = new Schema(
  {
    uid: { type: String },
    code: { type: String },
    name: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String },

    avatar: { type: String },
    gender: { type: String, enum: Object.values(Gender), default: Gender.OTHER },
    birthday: { type: Date },

    fullAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    context: { type: Schema.Types.Mixed, default: {} },

    signInProvider: { type: String },
    customerIds: { type: [Schema.Types.ObjectId], default: [], ref: "Customer" },
  },
  { timestamps: true }
);

// globalCustomerSchema.index({ name: "text" }, { weights: { name: 2 } });
globalCustomerSchema.index({ phone: 1 }, { unique: true });

globalCustomerSchema.index(
  { name: "text", code: "text", phone: "text" },
  { weights: { name: 2, code: 2, phone: 1 } }
);
export const GlobalCustomerHook = new ModelHook<IGlobalCustomer>(globalCustomerSchema);
export const GlobalCustomerModel: mongoose.Model<IGlobalCustomer> = MainConnection.model(
  "GlobalCustomer",
  globalCustomerSchema
);

export const GlobalCustomerLoader = ModelLoader<IGlobalCustomer>(
  GlobalCustomerModel,
  GlobalCustomerHook
);
