import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelHook, ModelLoader } from "../../../../base/baseModel";
import { SaleFeedContent, SaleFeedContentSchema } from "./saleFeedContent.graphql";
import { approvalStatus } from "../../../../constants/approveStatus";

const Schema = mongoose.Schema;

export type IShopSaleFeed = BaseDocument & {
  memberId?: string; // Mã member
  name?: string; // Tên bản tin
  snippet?: string; // Mô tả ngắn
  tips?: string; // Hướng dẫn
  contents?: SaleFeedContent[]; // Nội dung
  productId?: string; // Mã sản phẩm
  active?: boolean; // Trạng thái
  priority?: number; // Ưu tiên
  showOnMarketPlace: boolean; // Hiển thị trên marketplace
  approvalStatus: approvalStatus; // Trạng thái duyệt
  approvalDate: Date; // Ngày duyệt
  approvalBy: string; // Mã người duyệt
  shopSaleFeedGroupId?: string; // Mã nhóm tin đăng bán
};

const shopSaleFeedSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    snippet: { type: String },
    tips: { type: String },
    contents: { type: [SaleFeedContentSchema], default: [] },
    productId: { type: Schema.Types.ObjectId, required: true },
    active: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    showOnMarketPlace: { type: Boolean },
    approvalStatus: {
      type: String,
      enum: Object.values(approvalStatus),
      default: approvalStatus.PENDING,
    },
    approvalDate: { type: Date },
    approvalBy: { type: Schema.Types.ObjectId, ref: "User" },
    shopSaleFeedGroupId: { type: Schema.Types.ObjectId, ref: "ShopSaleFeedGroup" },
  },
  { timestamps: true }
);

shopSaleFeedSchema.index({ memberId: 1, priority: 1 });
shopSaleFeedSchema.index({ name: "text", snippet: "text" }, { weights: { name: 2, snippet: 1 } });

export const ShopSaleFeedHook = new ModelHook<IShopSaleFeed>(shopSaleFeedSchema);
export const ShopSaleFeedModel: mongoose.Model<IShopSaleFeed> = MainConnection.model(
  "ShopSaleFeed",
  shopSaleFeedSchema
);

export const ShopSaleFeedLoader = ModelLoader<IShopSaleFeed>(ShopSaleFeedModel, ShopSaleFeedHook);
