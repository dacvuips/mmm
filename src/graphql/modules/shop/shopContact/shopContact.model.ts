import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopContact = BaseDocument & {
  name?: string; // Họ và tên
  company?: string; // tên công ty
  email?: string; // email
  avalableTime?: string; // Thời gian nghe máy
  message?: string; // Tin nhắn

  memberId?: string; // Mã cửa hàng
};

const shopContactSchema = new Schema(
  {
    name: { type: String },
    company: { type: String },
    email: { type: String, required: true },
    avalableTime: { type: String },
    message: { type: String },

    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

// shopContactSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopContactHook = new ModelHook<IShopContact>(shopContactSchema);
export const ShopContactModel: mongoose.Model<IShopContact> = MainConnection.model(
  "ShopContact",
  shopContactSchema
);

export const ShopContactLoader = ModelLoader<IShopContact>(ShopContactModel, ShopContactHook);
