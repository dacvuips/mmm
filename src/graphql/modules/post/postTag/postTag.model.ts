import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IPostTag = BaseDocument & {
  name?: string; // Tên tag
  slug?: string; // Từ khoá
  description?: string; // Mô tả
  accentColor?: string; // Mã màu
  featureImage?: string; // Hình ảnh đại diện
};

const postTagSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    accentColor: { type: String },
    featureImage: { type: String },
  },
  { timestamps: true }
);

postTagSchema.index({ name: "text", slug: "text" }, { weights: { name: 2, slug: 1 } });
postTagSchema.index({ slug: 1 }, { unique: true });

export const PostTagHook = new ModelHook<IPostTag>(postTagSchema);
export const PostTagModel: mongoose.Model<IPostTag> = MainConnection.model(
  "PostTag",
  postTagSchema
);

export const PostTagLoader = ModelLoader<IPostTag>(PostTagModel, PostTagHook);
