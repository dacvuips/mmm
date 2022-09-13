import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type ITopic = BaseDocument & {
  name?: string; // Tên chủ đề
  slug?: string; // slug
  image?: string; // Hình ảnh
  group?: string; // nhóm
};

const topicSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    group: { type: String },
  },
  { timestamps: true }
);

topicSchema.index({ slug: 1 }, { unique: true });
topicSchema.index({ name: "text" }, { weights: { name: 2 } });

export const TopicHook = new ModelHook<ITopic>(topicSchema);
export const TopicModel: mongoose.Model<ITopic> = MainConnection.model("Topic", topicSchema);

export const TopicLoader = ModelLoader<ITopic>(TopicModel, TopicHook);
