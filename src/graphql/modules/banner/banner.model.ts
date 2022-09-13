import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { BannerActionType } from "../shop/shopConfig/shopBanner.graphql";
const Schema = mongoose.Schema;

export type IBanner = BaseDocument & {
  image?: string; // Hình ảnh
  title?: string; // Tiêu đề
  subtitle?: string; // Mô tả tiêu đề
  actionType?: BannerActionType; // Loại hành động
  link?: string; // Đường dẫn website
  productId?: string; // Mã sản phẩm
  voucherId?: string; // Mã voucher
  isPublic?: boolean; // Hiển thị công khai
  priority?: number; // Ưu tiên
  memberId?: string; // Mã cửa hàng
  position?: string; // Vị trí
};

const bannerSchema = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    actionType: { type: String, enum: Object.values(BannerActionType), required: true },
    link: { type: String },
    productId: { type: String },
    voucherId: { type: String },
    isPublic: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    position: { type: String },
  },
  { timestamps: true }
);

bannerSchema.index({ title: "text" }, { weights: { title: 2 } });

export const BannerHook = new ModelHook<IBanner>(bannerSchema);
export const BannerModel: mongoose.Model<IBanner> = MainConnection.model("Banner", bannerSchema);

export const BannerLoader = ModelLoader<IBanner>(BannerModel, BannerHook);
