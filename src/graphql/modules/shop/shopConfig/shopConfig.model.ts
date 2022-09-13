import mongoose from "mongoose";

import { BaseDocument, ModelHook, ModelLoader } from "../../../../base/baseModel";
import { MainConnection } from "../../../../loaders/database";
import { DiscountUnit } from "../shopVoucher/types/discountItem.schema";
import { AnalyticConfig, AnalyticConfigSchema } from "./analytic/analyticConfig.graphql";
import { Bank, BankSchema } from "./bank.graphql";
import { DomainConfig, DomainConfigSchema } from "./domain/domainConfig.graphql";
import { ShopFeature, ShopFeatureSchema } from "./feature/shopFeature.graphql";
import { ManychatConfig, ManychatConfigSchema } from "./manychat/manychatConfig.graphql";
import { NotifyConfig, NotifyConfigSchema } from "./notify/notifyConfig.graphql";
import { OrderConfig, OrderConfigSchema } from "./order/orderConfig.graphql";
import { RewardPointConfig, RewardPointConfigSchema } from "./rewardPointConfig.graphql";
import { ShopBanner, ShopBannerSchema } from "./shopBanner.graphql";
import { ShopProductGroup, ShopProductGroupSchema } from "./shopProductGroup.graphql";
import { ShopTag, ShopTagSchema } from "./shopTag.graphql";
import { SupportConfig, SupportConfigSchema } from "./support/supportConfig.graphql";
import { ZaloConfig, ZaloConfigSchema } from "./zalo/zaloConfig.graphql";

const Schema = mongoose.Schema;

export enum CommissionBy {
  ORDER = "ORDER", // Hoa hồng trên đơn hàng
  ITEM = "ITEM", // Hoa hồng trên sản phẩm
}

export type IShopConfig = BaseDocument & {
  memberId?: string; // Mã chủ shop
  // VNPOST config
  vnpostToken?: string; // Token vnpost
  vnpostCode?: string; // Mã CRM VNPost
  vnpostPhone?: string; // Điện thoại VNPost
  vnpostName?: string; // Tên người dùng VNPost
  // Shipping config
  shipPreparationTime?: string; // Thời gian chuẩn bị
  shipDefaultDistance?: number; // Khoản cách giao hàng mặc định
  shipDefaultFee?: number; // Phí giao hàng mặc định
  shipNextFee?: number; // Phí ship cộng thêm mỗi km
  shipOneKmFee?: number; // Phí ship dưới 1 km
  shipUseOneKmFee?: boolean; // Bật phí ship dưới 1 km
  shipNote?: string; // Ghi chú cho shipper
  shipAhamoveToken?: string; // Token ship Ahamove
  // Banner hiển thị
  banners?: ShopBanner[]; // Banner của shop
  productGroups?: ShopProductGroup[]; // Nhóm sản phẩm của shop
  rating?: number; // Đánh giá sao
  ratingQty?: number; // Số lượng đánh giá
  soldQty?: number; // Số lượng đã bán
  tags?: ShopTag[]; // Tags đánh giá cho cửa hàng
  // Upsale
  upsaleTitle?: string; // Tiêu đề Upsale
  // theme
  primaryColor?: string; // Màu primary
  accentColor?: string; // Màu accent
  // sms
  smsOrder?: boolean; // Bật tin nhắn đơn hàng
  smsOtp?: boolean; // Bạt tin nhắn OTP
  smsCol?: boolean; // Bật tin nhắn CTV
  // Cộng tác viên
  collaborator?: boolean; // Bật / tắt cộng tác viên
  colApprove?: boolean; // Yêu cầu duyệt cộng tác viên
  colMinOrder?: number; // Yêu cầu CTV có số đơn tối thiểu
  colCommissionBy?: CommissionBy; // Tính hoa hồng dựa trên điệu kiên gì
  colCommissionUnit?: DiscountUnit; // Hoa hồng cố định theo % hoặc VND
  colCommissionValue?: number; // Giá trị hoa hồng trên từng đơn hàng
  colTerm?: string; // Điều khoản cộng tác viên

  // Payment Config
  // Casso
  cassoEnabled?: boolean; // Bật / tắt chuyển khoản ngân hàng qua casso
  cassoApiKey?: string; // API Key của Casso
  cassoWebhookId?: number; // Mã Webhook
  cassoStatus?: string; // Trạng thái kết nối
  cassoUser?: any; // Tài khoản Casso
  banks?: Bank[]; // Danh sách tài khoản ngân hàng

  // COD
  codEnabled?: boolean; // Bật / tắt thanh toán khi nhận hàng

  // MOMO
  momoEnabled?: boolean; // Bật / tắt thanh toán momo

  // VNPay
  vnpayEnabled?: boolean; // Bật / tắt thanh toán vnpay

  // ZaloPay
  zalopayEnabled?: boolean; // Bật / tắt thanh toán zalo
  // Limit Order
  limitOpenOrder?: number; // Giới hạn số đơn được đặt cùng 1 lúc
  limitItem?: number; // Giới hạn số sản phẩm trong 1 đơn hàng

  // Manychat
  manychatConfig?: ManychatConfig; // Cấu hình many chat
  // Zalo
  zaloConfig?: ZaloConfig; // Cấu hình zalo

  features?: ShopFeature; // Tính năng
  rewardPointConfig?: RewardPointConfig; // Cấu hình điểm thưởng
  notifyConfig?: NotifyConfig; // Cấu hình nội dung thông báo
  supportConfig?: SupportConfig; // Cấu hình trang hỗ trợ
  orderConfig?: OrderConfig; // Cấu hình đơn hàng

  domainConfig?: DomainConfig; // Cấu hình tên miền
  analyticConfig?: AnalyticConfig; // Cấu hình phân tích

  intro?: string; // Thông tin chung
};

const shopConfigSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    vnpostToken: { type: String },
    vnpostCode: { type: String },
    vnpostPhone: { type: String },
    vnpostName: { type: String },
    shipPreparationTime: { type: String },
    shipDefaultDistance: { type: Number, default: 0, min: 0 },
    shipDefaultFee: { type: Number, default: 0, min: 0 },
    shipNextFee: { type: Number, default: 0, min: 0 },
    shipOneKmFee: { type: Number, default: 0, min: 0 },
    shipUseOneKmFee: { type: Boolean, default: false },
    shipNote: { type: String },
    shipAhamoveToken: { type: String },
    banners: { type: [ShopBannerSchema], default: [] },
    productGroups: { type: [ShopProductGroupSchema], default: [] },
    rating: { type: Number, default: 0 },
    ratingQty: { type: Number, default: 0 },
    soldQty: { type: Number, default: 0 },
    tags: { type: [ShopTagSchema], default: [] },
    upsaleTitle: { type: String, default: "Ngon hơn khi ăn kèm" },
    primaryColor: { type: String },
    accentColor: { type: String },
    smsOrder: { type: Boolean, default: false },
    smsOtp: { type: Boolean, default: false },
    smsCol: { type: Boolean, default: false },
    collaborator: { type: Boolean, default: false },
    colApprove: { type: Boolean, default: false },
    colMinOrder: { type: Number, default: 0, min: 0 },
    colCommissionBy: {
      type: String,
      enum: Object.values(CommissionBy),
      default: CommissionBy.ORDER,
    },
    colCommissionUnit: {
      type: String,
      enum: Object.values(DiscountUnit),
      default: DiscountUnit.VND,
    },
    colCommissionValue: { type: Number, default: 0, min: 0 },
    colTerm: { type: String },
    cassoEnabled: { type: Boolean, default: false },
    cassoApiKey: { type: String },
    cassoWebhookId: { type: Number },
    cassoUser: { type: Schema.Types.Mixed },
    cassoStatus: { type: String, default: "disconnect" },
    banks: { type: [BankSchema], default: [] },
    codEnabled: { type: Boolean, default: true },
    momoEnabled: { type: Boolean, default: false },
    vnpayEnabled: { type: Boolean, default: false },
    zalopayEnabled: { type: Boolean, default: false },
    limitOpenOrder: { type: Number, default: 0 },
    limitItem: { type: Number, default: 0 },
    manychatConfig: { type: ManychatConfigSchema, default: { active: false } },
    zaloConfig: { type: ZaloConfigSchema, default: { active: false } },
    features: { type: ShopFeatureSchema },
    rewardPointConfig: { type: RewardPointConfigSchema, default: { active: false } },
    notifyConfig: { type: NotifyConfigSchema, default: {} },
    supportConfig: { type: SupportConfigSchema, default: {} },
    orderConfig: { type: OrderConfigSchema, default: {} },
    domainConfig: { type: DomainConfigSchema, default: { active: false } },
    analyticConfig: { type: AnalyticConfigSchema, default: {} },
    intro: { type: String },
  },
  { timestamps: true }
);

shopConfigSchema.index({ memberId: 1 }, { unique: true });
// shopConfigSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopConfigHook = new ModelHook<IShopConfig>(shopConfigSchema);
export const ShopConfigModel: mongoose.Model<IShopConfig> = MainConnection.model(
  "ShopConfig",
  shopConfigSchema
);

export const ShopConfigLoader = ModelLoader<IShopConfig>(ShopConfigModel, ShopConfigHook);
