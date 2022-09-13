import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IThreadLabel = BaseDocument & {
  memberId?: string; // Mã chủ shop
  name?: string; // Tên nhãn
  color?: string; // Màu sắc
};

const threadLabelSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    name: { type: String, required: true },
    color: { type: String, default: "#333333" },
  },
  { timestamps: true }
);
threadLabelSchema.index({ memberId: 1, name: 1 }, { unique: true });
threadLabelSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ThreadLabelHook = new ModelHook<IThreadLabel>(threadLabelSchema);
export const ThreadLabelModel: mongoose.Model<IThreadLabel> = MainConnection.model(
  "ThreadLabel",
  threadLabelSchema
);

export const ThreadLabelLoader = ModelLoader<IThreadLabel>(ThreadLabelModel, ThreadLabelHook);
