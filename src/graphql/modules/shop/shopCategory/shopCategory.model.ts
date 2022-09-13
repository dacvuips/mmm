import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopCategory = BaseDocument & {
  name?: string; // Tên phân loại
  image?: string; // Hình ảnh
  desc?: string; // Mô tả
  priority?: number; // Ưu tiên
};

const shopCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    desc: { type: String },
    priority: { type: String },
  },
  { timestamps: true }
);

shopCategorySchema.index({ name: 1 }, { unique: true });
shopCategorySchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopCategoryHook = new ModelHook<IShopCategory>(shopCategorySchema);
export const ShopCategoryModel: mongoose.Model<IShopCategory> = MainConnection.model(
  "ShopCategory",
  shopCategorySchema
);

export const ShopCategoryLoader = ModelLoader<IShopCategory>(ShopCategoryModel, ShopCategoryHook);
