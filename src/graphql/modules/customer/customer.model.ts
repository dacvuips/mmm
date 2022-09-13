import mongoose from "mongoose";

import { BaseDocument, ModelHook, ModelLoader } from "../../../base/baseModel";
import { MainConnection } from "../../../loaders/database";
import { Gender } from "../member/member.model";
import {
  CustomerMomoWallet,
  CustomerMomoWalletSchema,
} from "./momoWallet/customerMomoWallet.graphql";

const Schema = mongoose.Schema;
export type CustomerPageAccount = {
  psid?: string; // PSID người dùng
  pageId?: string; // ID của Fanpage
  memberId?: string; // Mã thành viên
};
const customerPageAccountSchema = new Schema({
  psid: { type: String },
  pageId: { type: String },
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
});

export type ICustomer = BaseDocument & {
  memberId?: string; // Mã chủ shop
  code?: string; // Mã khách hàng
  name?: string; // Tên khách hàng
  facebookName?: string; // Tên facebook
  uid?: string; // UID
  phone?: string; // Số điện thoại
  email?: string; // Email
  idCard?: string; // Số chứng minh nhân dân
  password?: string; // Mã pin
  avatar?: string; // Avatar
  gender?: Gender; // Giới tính
  birthday?: Date; // Ngày sinh
  address?: string; // Địa chỉ
  fullAddress?: string; // Full địa chỉ
  addressNote?: string; // Ghi chú địa chỉ
  province?: string; // Tỉnh / thành
  district?: string; // Quận / huyện
  ward?: string; // Phường / xã
  provinceId?: string; // Mã Tỉnh / thành
  districtId?: string; // Mã Quận / huyện
  wardId?: string; // Mã Phường / xã
  cumulativePoint?: number; // Điểm tích lũy
  commission: number; // Hoa hồng cộng tác viên
  pageAccounts?: CustomerPageAccount[]; // Danh sách account facebook của người dùng
  latitude?: number;
  longitude?: number;
  otp?: string; // Mã otp 6 số
  otpExpired?: Date; // Thời hạn OTP
  otpRetry?: number; // Số lần gửi lại OTP
  otpRetryExpired?: Date; // Thời gian thử lại
  collaboratorId?: string; // Mã cộng tác viên
  presenterId?: string; // Mã người giới thiệu
  context?: any; // Dữ liệu khách hàng

  manychatSubscriber?: any; // Người dùng subscriber
  psid?: string; // Mã PSID Facebook
  followerId?: string; // Mã follower Zalo
  zaloFollower?: any; // Người dùng Zalo
  threadId?: string; // Mã cuộc trò truyện

  globalCustomerId?: string; // Mã global customer
  momoWallet?: CustomerMomoWallet; // Tài khoản momo
};

const customerSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    code: { type: String },
    name: { type: String, default: "" },
    facebookName: { type: String },
    uid: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    idCard: { type: String },
    password: { type: String },
    avatar: { type: String },
    gender: { type: String, enum: Object.values(Gender), default: Gender.OTHER },
    birthday: { type: Date },
    address: { type: String },
    fullAddress: { type: String },
    addressNote: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    provinceId: { type: String },
    districtId: { type: String },
    wardId: { type: String },
    cumulativePoint: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    pageAccounts: { type: [customerPageAccountSchema], default: [] },

    latitude: { type: Number },
    longitude: { type: Number },
    otp: { type: String },
    otpExpired: { type: Date },
    otpRetry: { type: Number, default: 0 },
    otpRetryExpired: { type: Date },
    collaboratorId: { type: Schema.Types.ObjectId, ref: "Collaborator" },
    presenterId: { type: Schema.Types.ObjectId, ref: "Customer" },
    context: { type: Schema.Types.Mixed, default: {} },

    manychatSubscriber: { type: Schema.Types.Mixed, default: {} },
    psid: { type: String },
    followerId: { type: String },
    zaloFollower: { type: Schema.Types.Mixed, default: {} },
    threadId: { type: Schema.Types.ObjectId },
    globalCustomerId: { type: Schema.Types.ObjectId, ref: "GlobalCustomer" },
    momoWallet: { type: CustomerMomoWalletSchema, default: {} },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1, memberId: 1 }, { unique: true });

customerSchema.index(
  { name: "text", code: "text", facebookName: "text", phone: "text" },
  { weights: { name: 2, code: 2, facebookName: 2, phone: 1 } }
);

export const CustomerHook = new ModelHook<ICustomer>(customerSchema);
export const CustomerModel: mongoose.Model<ICustomer> = MainConnection.model(
  "Customer",
  customerSchema
);

export const CustomerLoader = ModelLoader<ICustomer>(CustomerModel, CustomerHook);
