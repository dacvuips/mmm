import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum StaffScope {
  REPORT = "REPORT", // Xem thống kê
  MANAGER = "MANAGER", // Quản lý
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  USER = "USER",
  VIEWER = "VIEWER",
}

export type IStaff = BaseDocument & {
  /** Mã chủ shop */
  memberId?: string;
  /** Tên đăng nhập */
  username?: string;
  /** Mật khẩu */
  password?: string;
  /** Tên nhân viên */
  name?: string;
  /** Điện thoại nhân viên */
  phone?: string;
  /** Ảnh đại diện */
  avatar?: string;
  /** Địa chỉ liên hệ */
  address?: string;
  /** Mã chi nhánh */
  branchId?: string;
  /** Danh sách phân quyền */
  scopes?: StaffScope[];
  /** Email */
  email?: string;
};

const staffSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    address: { type: String },
    branchId: { type: Schema.Types.ObjectId, ref: "ShopBranch", required: true },
    scopes: { type: [{ type: String, enum: Object.values(StaffScope) }], default: [] },
    email: { type: String },
  },
  { timestamps: true }
);

staffSchema.index({ memberId: 1, username: 1 });
staffSchema.index(
  { username: "text", name: "text", phone: "text" },
  { weights: { username: 2, name: 2, phone: 2 } }
);

export const StaffHook = new ModelHook<IStaff>(staffSchema);
export const StaffModel: mongoose.Model<IStaff> = MainConnection.model("Staff", staffSchema);

export const StaffLoader = ModelLoader<IStaff>(StaffModel, StaffHook);
