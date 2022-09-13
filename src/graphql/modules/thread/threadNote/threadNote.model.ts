import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export type IThreadNote = BaseDocument & {
  threadId?: string; // Mã thread
  text?: string; // Nội dung
  attachment?: any; // Đính kèm
};

const threadNoteSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String },
    attachment: { type: String },
  },
  { timestamps: true }
);

threadNoteSchema.index({ threadId: 1 });
// threadNoteSchema.index({ name: "text" }, { weights: { name: 2 } });

export const ThreadNoteHook = new ModelHook<IThreadNote>(threadNoteSchema);
export const ThreadNoteModel: mongoose.Model<IThreadNote> = MainConnection.model(
  "ThreadNote",
  threadNoteSchema
);

export const ThreadNoteLoader = ModelLoader<IThreadNote>(ThreadNoteModel, ThreadNoteHook);
