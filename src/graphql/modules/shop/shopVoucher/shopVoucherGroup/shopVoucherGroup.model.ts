import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopVoucherGroup = BaseDocument & {
  name?: string; // Tên nhóm voucher
  priority?: number; // Ưu tiên
  active?: boolean; // Kích hoạt
};

const shopVoucherGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    priority: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shopVoucherGroupSchema.index({ name: "text" }, { weights: { name: 2 } });
shopVoucherGroupSchema.index({ priority: 1 });

export const ShopVoucherGroupHook = new ModelHook<IShopVoucherGroup>(shopVoucherGroupSchema);
export const ShopVoucherGroupModel: mongoose.Model<IShopVoucherGroup> = MainConnection.model(
  "ShopVoucherGroup",
  shopVoucherGroupSchema
);

export const ShopVoucherGroupLoader = ModelLoader<IShopVoucherGroup>(
  ShopVoucherGroupModel,
  ShopVoucherGroupHook
);
