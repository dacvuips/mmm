import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { Context } from "../../../../context";

export type OrderConfig = {
  allowCancel?: boolean; // Cho phép huỷ
  ahamoveEnabled?: boolean; // Bật giao hàng ahamove
  ahamoveFastForward?: boolean; // Giao hàng nhanh bằng ahamove
  ahamoveFastForwardDelay?: number; // Thời gian chuyển nhanh qua ahamove
  ahamoveShipFee?: boolean; // Tính phí ship theo ahamove
  skipCart?: boolean; // Bỏ qua giỏ hàng
};
export const OrderConfigSchema = new Schema({
  allowCancel: { type: Boolean, default: false },
  ahamoveEnabled: { type: Boolean, default: false },
  ahamoveFastForward: { type: Boolean, default: false },
  ahamoveFastForwardDelay: { type: Number, default: 0 },
  ahamoveShipFee: { type: Boolean, default: false },
  skipCart: { type: Boolean, default: false },
});
export default {
  schema: gql`
    type OrderConfig {
      "Cho phép huỷ"
      allowCancel: Boolean
      "Bật giao hàng ahamove"
      ahamoveEnabled: Boolean
      "Giao hàng nhanh bằng ahamove"
      ahamoveFastForward: Boolean
      "Thời gian chuyển nhanh qua ahamove"
      ahamoveFastForwardDelay: Int
      "Tính phí ship theo ahamove"
      ahamoveShipFee: Boolean
      "Bỏ qua giỏ hàng"
      skipCart: Boolean
    }
    input OrderConfigInput {
      "Cho phép huỷ"
      allowCancel: Boolean
      "Bật giao hàng ahamove"
      ahamoveEnabled: Boolean
      "Giao hàng nhanh bằng ahamove"
      ahamoveFastForward: Boolean
      "Thời gian chuyển nhanh qua ahamove"
      ahamoveFastForwardDelay: Int
      "Tính phí ship theo ahamove"
      ahamoveShipFee: Boolean
      "Bỏ qua giỏ hàng"
      skipCart: Boolean
    }
    extend type ShopConfig {
      orderConfig: OrderConfig
    }
    extend input UpdateShopConfigInput {
      orderConfig: OrderConfigInput
    }
  `,
  resolver: {},
};
