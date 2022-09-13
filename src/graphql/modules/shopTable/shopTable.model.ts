import mongoose from "mongoose";
import { BaseDocument, ModelHook, ModelLoader } from "../../../base/baseModel";
import { MainConnection } from "../../../loaders/database";
const Schema = mongoose.Schema;

export type IShopTable = BaseDocument & {
  name?: string; // ten ban
  code?: string; // ma ban
  memberId?: string; // * ma cua hang
  branchId?: string; // ma chi nhanh
};

const shopTableSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, required: true },
    branchId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

shopTableSchema.index({ memberId: 1, branchId: 1 });
shopTableSchema.index({ code: 1, memberId: 1, branchId: 1 }, { unique: true });
shopTableSchema.index({ name: "text", code: "text" }, { weights: { name: 2, code: 2 } });

export const ShopTableHook = new ModelHook<IShopTable>(shopTableSchema);
export const ShopTableModel: mongoose.Model<IShopTable> = MainConnection.model(
  "ShopTable",
  shopTableSchema
);

export const ShopTableLoader = ModelLoader<IShopTable>(ShopTableModel, ShopTableHook);
