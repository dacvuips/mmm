import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { ChatbotStory, ChatbotStorySchema } from "./types/chatbotStory.type";
import { ISubscription, SubscriptionSchema } from "../subscription/subscription.model";
import { addMemberMethod, MemberMethod } from "./member.method";

const Schema = mongoose.Schema;
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}
export enum MemberType {
  BRANCH = "BRANCH",
  SALE = "SALE",
  AGENCY = "AGENCY",
}

export type IMember = BaseDocument &
  MemberMethod & {
    username?: string; // Mã chủ shop
    password?: string; // Mật khẩu chủ shop
    code?: string; // Mã chủ shop
    uid?: string; // UID Firebase
    name?: string; // Họ tên
    avatar?: string; // Avatar
    phone?: string; // Điện thoại
    phoneVerified?: boolean; // Đã xác thực điện thoại
    fanpageId?: string; // Mã Fanpage
    fanpageName?: string; // Tên Fanpage
    fanpageImage?: string; // Hình Fanpage
    chatbotKey?: string; // Chatbot API Key
    shopName?: string; // Tên cửa hàng
    shopLogo?: string; // Logo cửa hàng
    shopCover?: string; // Hình cover cửa hàng
    cumulativePoint?: number; // Điểm tích lũy
    diligencePoint?: number; // Điểm chuyen can
    commission?: number; // Hoa hồng
    address?: string; // Địa chỉ
    provinceId?: string; // Mã Tỉnh/thành
    districtId?: string; // Mã Quận/huyện
    wardId?: string; // Mã Phường/xã
    province?: string; // Tỉnh/thành
    district?: string; // Quận/huyện
    ward?: string; // Phường/xã
    identityCardNumber?: string; // CMND
    gender?: Gender; // Giới tính
    birthday?: Date; // Sinh nhật
    parentIds?: [string]; // Mã người giới thiệu ////
    activedAt?: Date; // Ngày đăng ký
    activated?: boolean; // Chủ shop đã kích hoạt
    type?: MemberType; // Loại chủ shop
    branchId?: string; // Mã chi nhánh
    positionId?: string; // Mã chức vụ
    psids?: string[]; // Mã PSID ở trang fanpage chính
    chatbotStory?: ChatbotStory; // Kịch bản chatbot
    // delivery
    addressStorehouseIds: string[]; // danh sách id kho
    addressDeliveryIds: string[]; // danh sách id điểm nhận
    mainAddressStorehouseId: string;
    isPost: boolean; // là bưu điện
    facebookAccessToken: string;
    lastLoginDate: Date;
    allowSale: boolean;
    categoryId?: string; // Phân loại cửa hàng
    subscription?: ISubscription;
    locked?: boolean; // Bị khoá
    context?: any;
    threadId?: string; // Mã trao đổi
    walletId?: string; // Mã ví
    memberGroupId?: string; // Mã nhóm member
  };

const memberSchema = new Schema(
  {
    code: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String },
    uid: { type: String },
    name: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String, required: true },
    phoneVerified: { type: Boolean, default: false },
    fanpageId: { type: String },
    fanpageName: { type: String },
    fanpageImage: { type: String },
    chatbotKey: { type: String },
    shopName: { type: String },
    shopLogo: { type: String },
    shopCover: { type: String },
    cumulativePoint: { type: Number, default: 0 },
    diligencePoint: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    address: { type: String },
    provinceId: { type: String },
    districtId: { type: String },
    wardId: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    identityCardNumber: { type: String },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.OTHER,
    },
    birthday: { type: Date },
    parentIds: { type: [String] },
    activedAt: { type: Date },
    activated: { type: Boolean, default: false },
    type: { type: String, enum: Object.values(MemberType) },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    positionId: { type: Schema.Types.ObjectId, ref: "Position" },
    psids: { type: [String], default: [] },
    chatbotStory: { type: ChatbotStorySchema },
    // delivery
    mainAddressStorehouseId: {
      type: Schema.Types.ObjectId,
      ref: "AddressStorehouse",
    },
    mainAddressDeliveryId: {
      type: Schema.Types.ObjectId,
      ref: "AddressDelivery",
    }, //
    addressStorehouseIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "AddressStorehouse" }],
    }, // danh sách id kho
    addressDeliveryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "AddressDelivery" }],
    }, //
    isPost: { type: Boolean, default: false },
    facebookAccessToken: { type: String },
    lastLoginDate: { type: Date },
    allowSale: { type: Boolean, default: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ShopCategory" },
    subscription: { type: SubscriptionSchema },
    locked: { type: Boolean, default: false },
    context: { type: Schema.Types.Mixed },
    threadId: { type: Schema.Types.ObjectId },
    walletId: { type: Schema.Types.ObjectId },
    memberGroupId: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

memberSchema.index(
  {
    code: "text",
    name: "text",
    phone: "text",
    fanpageName: "text",
    fanpageId: "text",
    shopName: "text",
    address: "text",
    username: "text",
  },
  {
    weights: {
      code: 2,
      name: 2,
      phone: 2,
      fanpageName: 2,
      fanpageId: 2,
      shopName: 2,
      address: 3,
      username: 4,
    },
  }
);
memberSchema.index({ username: 1 }, { unique: true });
memberSchema.index({ uid: 1 });

addMemberMethod(memberSchema);

export const MemberHook = new ModelHook<IMember>(memberSchema);
export const MemberModel: mongoose.Model<IMember> = MainConnection.model("Member", memberSchema);

export const MemberLoader = ModelLoader<IMember>(MemberModel, MemberHook);
