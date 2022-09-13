import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

export enum UserScope {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  USER = "USER",
  VIEWER = "VIEWER",
}
export type IUser = BaseDocument & {
  /** Mã UID Firebase*/
  uid?: string;
  /** Email */
  email?: string;
  /** Tên tài khoản */
  name?: string;
  /** Vai trò */
  role?: UserRole;
  /** Điện thoại */
  phone?: string;
  /** Địa chỉ */
  address?: string;
  /** Avatar */
  avatar?: string;
  /** Tỉnh thành */
  province?: string;
  /** Quận huyện */
  district?: string;
  /** Phường xã */
  ward?: string;
  /** Mã Tỉnh/thành */
  provinceId?: string;
  /** Mã Quận/huyện */
  districtId?: string;
  /** Mã Phường/xã */
  wardId?: string;
  /** Mã PSID Facebook */
  psid?: string;
  /** Mã Token Facebook */
  facebookAccessToken?: string;
  /** Phân quyền tài khoản */
  scopes?: UserScope[];
};

const userSchema = new Schema(
  {
    uid: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: Object.values(UserRole) },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    provinceId: { type: String },
    districtId: { type: String },
    wardId: { type: String },
    psid: { type: String },
    facebookAccessToken: { type: String },
    scopes: { type: [String], enum: Object.values(UserScope) },
  },
  { timestamps: true, collation: { locale: "vi" } }
);

userSchema.index({ uid: 1 }, { unique: true });
userSchema.index({ name: "text" }, { weights: { name: 10 } });

export const UserHook = new ModelHook<IUser>(userSchema);
export const UserModel: mongoose.Model<IUser> = MainConnection.model("User", userSchema);

export const UserLoader = ModelLoader<IUser>(UserModel, UserHook);
