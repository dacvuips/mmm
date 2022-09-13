import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;
export enum PostStatus {
  PUBLIC = "PUBLIC", // Công khai
  DRAFT = "DRAFT", // Nháp
}
export type IPost = BaseDocument & {
  title?: string; // Tiêu đề
  excerpt?: string; // Đoạn trích
  slug?: string; // từ khoá
  status?: PostStatus; // Trạng thái
  publishedAt?: Date; // Ngày công khai
  featureImage?: string; // Hình đại diện
  metaDescription?: string; // Mô tả meta tag
  metaTitle?: string; // Tiêu đề meta tag
  content?: string; // Nội dung html
  tagIds?: string[]; // Danh sách tag
  ogDescription?: string; // Mô tả open graph
  ogImage?: string; // Hình ảnh open graph
  ogTitle?: string; // Tiêu đề open graph
  twitterDescription?: string; // Mô tả twitter
  twitterImage?: string; // Hình ảnh twitter
  twitterTitle?: string; // Tiêu đề twitter
  priority?: number; // Độ ưu tiên
  view?: number; // Số lượt view
  topicIds?: string[]; // Danh sách chủ đề
  // attachmentIds?: string[]; // Danh sách file đính kèm
};

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String },
    slug: { type: String, required: true },
    status: { type: String, enum: Object.values(PostStatus), default: PostStatus.DRAFT },
    publishedAt: { type: Date },
    featureImage: { type: String },
    metaDescription: { type: String },
    metaTitle: { type: String },
    content: { type: String, required: true },
    tagIds: { type: [{ type: Schema.Types.ObjectId, ref: "PostTag" }] },
    ogDescription: { type: String },
    ogImage: { type: String },
    ogTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
    twitterTitle: { type: String },
    priority: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    topicIds: { type: [String], default: [] },
    // attachmentIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", slug: "text" }, { weights: { title: 2, slug: 1 } });
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ priority: 1 });

export const PostHook = new ModelHook<IPost>(postSchema);
export const PostModel: mongoose.Model<IPost> = MainConnection.model("Post", postSchema);

export const PostLoader = ModelLoader<IPost>(PostModel, PostHook);
