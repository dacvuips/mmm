import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export enum LoginMethod {
  /** Đăng nhập bằng Mật khẩu */
  PASSWORD = "PASSWORD",
}

export type IAccount = BaseDocument & {
  /** Mã tài khoản */
  code: string;
  /** Phương thức đăng nhập */
  loginMethod: LoginMethod;
  /** Key truy cập */
  accessKey: string;
  /** Mật khẩu */
  passwordHash: string;
  /** Salt */
  salt: string;
  /** Đăng nhập lần cuối */
  lastSignedInAt: Date;
  /** Email */
  email: string;
  /** Đã xác thực email */
  emailVerified: boolean;
};

const accountSchema = new Schema(
  {
    code: { type: String, required: true },
    loginMethod: { type: String, enum: Object.values(LoginMethod), required: true },
    accessKey: { type: String },
    passwordHash: { type: String },
    salt: { type: String },
    email: { type: String },
    emailVerified: { type: Boolean, default: false },
    lastSignedInAt: { type: Date },
  },
  { timestamps: true }
);

accountSchema.index({ code: 1 }, { unique: true });
accountSchema.index({ accessKey: 1 }, { unique: true, sparse: true });
accountSchema.index(
  { code: "text", accessKey: "text", email: "text" },
  { weights: { code: 2, accessKey: 2, email: 2 } }
);

export const AccountHook = new ModelHook<IAccount>(accountSchema);
export const AccountModel: mongoose.Model<IAccount> = MainConnection.model(
  "Account",
  accountSchema
);

export const AccountLoader = ModelLoader<IAccount>(AccountModel, AccountHook);
