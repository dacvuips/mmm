import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopSaleFeedGroup = BaseDocument & {
  name?: string;
};

const shopSaleFeedGroupSchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

// shopSaleFeedGroupSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopSaleFeedGroupHook = new ModelHook<IShopSaleFeedGroup>(shopSaleFeedGroupSchema);
export const ShopSaleFeedGroupModel: mongoose.Model<IShopSaleFeedGroup> = MainConnection.model(
  "ShopSaleFeedGroup",
  shopSaleFeedGroupSchema
);

export const ShopSaleFeedGroupLoader = ModelLoader<IShopSaleFeedGroup>(
  ShopSaleFeedGroupModel,
  ShopSaleFeedGroupHook
);
