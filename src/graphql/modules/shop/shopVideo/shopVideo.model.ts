import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopVideo = BaseDocument & {
  memberId?: string; // Mã cửa hàng
  name?: string; // Tên video
  link?: string; // Link video
  thumbnail?: string; // Link thumbnail
  description?: string; // Mô tả
  active?: boolean; // Kích hoạt
  priority?: number; // Ưu tiên
};

const shopVideoSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    link: { type: String, required: true },
    thumbnail: { type: String },
    description: { type: String },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopVideoSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopVideoHook = new ModelHook<IShopVideo>(shopVideoSchema);
export const ShopVideoModel: mongoose.Model<IShopVideo> = MainConnection.model(
  "ShopVideo",
  shopVideoSchema
);

export const ShopVideoLoader = ModelLoader<IShopVideo>(ShopVideoModel, ShopVideoHook);
