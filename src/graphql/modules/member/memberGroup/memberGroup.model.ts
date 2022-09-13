import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IMemberGroup = BaseDocument & {
  name?: string; // Tên nhóm member
  priority?: number; // Ưu tiên
  active?: boolean; // Kích hoạt
};

const memberGroupSchema = new Schema(
  {
    name: { type: String },
    priority: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// memberGroupSchema.index({ name: "text" }, { weights: { name: 2 } });

export const MemberGroupHook = new ModelHook<IMemberGroup>(memberGroupSchema);
export const MemberGroupModel: mongoose.Model<IMemberGroup> = MainConnection.model(
  "MemberGroup",
  memberGroupSchema
);

export const MemberGroupLoader = ModelLoader<IMemberGroup>(MemberGroupModel, MemberGroupHook);
