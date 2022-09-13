import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopPostTag = BaseDocument & {
  memberId?: string; // Id của member
  name?: string; // Tên tag
  slug?: string; // Từ khoá
  description?: string; // Mô tả
  accentColor?: string; // Mã màu
  featureImage?: string; // Hình ảnh đại diện
};

const shopPostTagSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    accentColor: { type: String },
    featureImage: { type: String },
  },
  { timestamps: true }
);

shopPostTagSchema.index({ name: "text", slug: "text" }, { weights: { name: 2, slug: 1 } });
shopPostTagSchema.index({ memberId: 1, slug: 1 }, { unique: true });

export const ShopPostTagHook = new ModelHook<IShopPostTag>(shopPostTagSchema);
export const ShopPostTagModel: mongoose.Model<IShopPostTag> = MainConnection.model(
  "ShopPostTag",
  shopPostTagSchema
);

export const ShopPostTagLoader = ModelLoader<IShopPostTag>(ShopPostTagModel, ShopPostTagHook);
