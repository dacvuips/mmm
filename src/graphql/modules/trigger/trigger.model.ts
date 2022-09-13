import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
const Schema = mongoose.Schema;

export type ITrigger = BaseDocument & {
  memberId?: string; // Mã cửa hàng
  code?: string; // Mã trigger
  name?: string; // Tên trigger
  active?: boolean; // Kích hoạt
  event?: string; // Sự kiện kích hoạt
  actions?: any[]; // Hành động
  triggerGroupId?: string; // Nhóm trigger
};

const triggerSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: false },
    event: { type: String, required: true },
    actions: { type: [Schema.Types.Mixed], default: [] },
    triggerGroupId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

triggerSchema.index({ memberId: 1 });
triggerSchema.index({ memberId: 1, code: 1 }, { unique: true });
triggerSchema.index({ memberId: 1, event: 1 });
triggerSchema.index({ memberId: 1, triggerGruopId: 1 });
triggerSchema.index({ name: "text", code: "text" }, { weights: { name: 2, code: 2 } });

export const TriggerHook = new ModelHook<ITrigger>(triggerSchema);
export const TriggerModel: mongoose.Model<ITrigger> = MainConnection.model(
  "Trigger",
  triggerSchema
);

export const TriggerLoader = ModelLoader<ITrigger>(TriggerModel, TriggerHook);
