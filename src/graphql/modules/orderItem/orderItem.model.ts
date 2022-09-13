import mongoose from "mongoose";

import { BaseDocument, ModelHook, ModelLoader } from "../../../base/baseModel";
import { MainConnection } from "../../../loaders/database";
import { OrderStatus } from "../order/order.model";
import { OrderItemTopping, OrderItemToppingSchema } from "./types/orderItemTopping.schema";

const Schema = mongoose.Schema;

export type IOrderItem = BaseDocument & {
  orderId?: string; // Mã đơn hàng
  sellerId?: string; // Mã người bán
  fromMemberId: string; // từ shop nào
  buyerId?: string; // Mã người mua
  isPrimary?: boolean; // Sản phẩm chính của Mobifone
  isCrossSale: boolean; // Sản phẩm bán chéo
  productId?: string; //  Sản phẩm
  productName?: string; //  Tên sản phẩm
  basePrice?: number; //  Giá bán
  qty?: number; //  Số lượng
  amount?: number; // Thành tiền
  commission0: number; //  Hoa hồng Mobifone
  commission1: number; //  Hoa hồng điểm bán
  commission2: number; //  Hoa hồng giới thiệu
  commission3: number; // Hoa hồng kho
  sellerBonusPoint: number; //  Điểm thường người bán
  buyerBonusPoint: number; //  Điểm thưởng người mua
  campaignId: string; // mã chiến dịch
  campaignSocialResultId: string; // mã kết quả chiến dịch
  status: OrderStatus;
  // delivery
  note: string; // ghi chú sản phẩm
  productWeight: number;
  productLength: number;
  productWidth: number;
  productHeight: number;
  finishedAt: Date;

  toppings: OrderItemTopping[]; // Topping kèm theo
  toppingAmount: number; // Tổng tiên topping

  rewardPoint?: number; // Điểm thưởng
};

const orderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Member" },
    fromMemberId: { type: Schema.Types.ObjectId, ref: "Member" },
    buyerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    isPrimary: { type: Boolean, default: false },
    isCrossSale: { type: Boolean, default: false },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    basePrice: { type: Number, default: 0, min: 0 },
    qty: { type: Number, min: 1, required: true },
    commission0: { type: Number, default: 0, min: 0 },
    commission1: { type: Number, default: 0, min: 0 },
    commission2: { type: Number, default: 0, min: 0 },
    commission3: { type: Number, default: 0, min: 0 },
    sellerBonusPoint: { type: Number, default: 0, min: 0 },
    buyerBonusPoint: { type: Number, default: 0, min: 0 },
    amount: { type: Number, required: 0, default: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    campaignSocialResultId: {
      type: Schema.Types.ObjectId,
      ref: "CampaignSocialResult",
    },
    // delivery
    note: { type: Schema.Types.String },
    productWeight: { type: Number, default: 0, min: 0 },
    productLength: { type: Number, default: 0, min: 0 },
    productWidth: { type: Number, default: 0, min: 0 },
    productHeight: { type: Number, default: 0, min: 0 },
    finishedAt: { type: Date },

    toppings: { type: [OrderItemToppingSchema], default: [] },
    toppingAmount: { type: Number, default: 0, min: 0 },

    rewardPoint: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ finishedAt: 1 });
orderItemSchema.index({ status: 1 });
// orderItemSchema.index({ name: "text" }, { weights: { name: 2 } });

export const OrderItemHook = new ModelHook<IOrderItem>(orderItemSchema);
export const OrderItemModel: mongoose.Model<IOrderItem> = MainConnection.model(
  "OrderItem",
  orderItemSchema
);

export const OrderItemLoader = ModelLoader<IOrderItem>(OrderItemModel, OrderItemHook);
