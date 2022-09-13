import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IPostViewLog = BaseDocument & {
  postId?: string; // Mã post
  userId?: string; // Mã người dùng
  view?: number; // Lượt view
};

const postViewLogSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    view: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);
postViewLogSchema.index({ postId: 1, userId: 1 }, { unique: true });
// postViewLogSchema.index({ name: "text" }, { weights: { name: 2 } });

export const PostViewLogHook = new ModelHook<IPostViewLog>(postViewLogSchema);
export const PostViewLogModel: mongoose.Model<IPostViewLog> = MainConnection.model(
  "PostViewLog",
  postViewLogSchema
);

export const PostViewLogLoader = ModelLoader<IPostViewLog>(PostViewLogModel, PostViewLogHook);
