import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopTopic = BaseDocument & {
  memberId?: string; // Mã thành viên
  name?: string; // Tên chủ đề
  slug?: string; // slug
  image?: string; // Hình ảnh
  group?: string; // nhóm
};

const shopTopicSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    group: { type: String },
  },
  { timestamps: true }
);

shopTopicSchema.index({ memberId: 1, slug: 1 }, { unique: true });
shopTopicSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopTopicHook = new ModelHook<IShopTopic>(shopTopicSchema);
export const ShopTopicModel: mongoose.Model<IShopTopic> = MainConnection.model(
  "ShopTopic",
  shopTopicSchema
);

export const ShopTopicLoader = ModelLoader<IShopTopic>(ShopTopicModel, ShopTopicHook);
