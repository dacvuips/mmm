import mongoose from "mongoose";
import { MainConnection } from "../../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IShopPostViewLog = BaseDocument & {
  memberId?: string; // Mã thành viên
  postId?: string; // Mã post
  userId?: string; // Mã người dùng
  view?: number; // Lượt view
};

const shopPostViewLogSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    view: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

shopPostViewLogSchema.index({ memberId: 1, postId: 1, userId: 1 }, { unique: true });
// shopPostViewLogSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ShopPostViewLogHook = new ModelHook<IShopPostViewLog>(shopPostViewLogSchema);
export const ShopPostViewLogModel: mongoose.Model<IShopPostViewLog> = MainConnection.model(
  "ShopPostViewLog",
  shopPostViewLogSchema
);

export const ShopPostViewLogLoader = ModelLoader<IShopPostViewLog>(
  ShopPostViewLogModel,
  ShopPostViewLogHook
);
