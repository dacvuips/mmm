import { gql } from "apollo-server-express";
import { Schema } from "mongoose";

export type OfferItem = {
  productId?: string; // Mã sản phẩm
  qty?: number; // Số lượng sản phẩm
  note?: string; // Ghi chú
};
export const OfferItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, min: 1 },
  note: { type: String },
});
export type OfferItemGroup = {
  items: OfferItem[]; // Danh sách sản phẩm
  samePrice?: number; // Đồng giá
};
export const OfferItemGroupSchema = new Schema({
  items: { type: [OfferItemSchema], default: [] },
  samePrice: { type: Number },
});
export default gql`
  type OfferItem {
    "Mã sản phẩm"
    productId: ID
    "Số lượng sản phẩm"
    qty: Int
    "Ghi chú"
    note: String

    product: Product
  }

  input OfferItemInput {
    "Mã sản phẩm"
    productId: ID!
    "Số lượng sản phẩm"
    qty: Int!
    "Ghi chú"
    note: String
  }

  type OfferItemGroup {
    "Danh sách sản phẩm"
    items: [OfferItem]
    "Đồng giá"
    samePrice: Float
  }
  input OfferItemGroupInput {
    "Danh sách sản phẩm"
    items: [OfferItemInput]
    "Đồng giá"
    samePrice: Float
  }
`;
