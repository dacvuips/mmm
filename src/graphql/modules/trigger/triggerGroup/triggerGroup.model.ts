import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type ITriggerGroup = BaseDocument & {
  memberId?: string; // Mã chủ shop
  name?: string; // Tên nhóm trigger
  description?: string; // Mô tả
  triggerIds?: string[]; // Danh sách trigger
};

const triggerGroupSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String },
    triggerIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

triggerGroupSchema.index({ memberId: 1 });
triggerGroupSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 2 } }
);

export const TriggerGroupHook = new ModelHook<ITriggerGroup>(triggerGroupSchema);
export const TriggerGroupModel: mongoose.Model<ITriggerGroup> = MainConnection.model(
  "TriggerGroup",
  triggerGroupSchema
);

export const TriggerGroupLoader = ModelLoader<ITriggerGroup>(TriggerGroupModel, TriggerGroupHook);
