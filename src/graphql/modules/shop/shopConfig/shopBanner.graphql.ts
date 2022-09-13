import { gql } from "apollo-server-express";
import { Schema } from "mongoose";

import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { ProductLoader } from "../../product/product.model";
import { ShopVoucherLoader } from "../shopVoucher/shopVoucher.model";

export enum ShopBannerType {
  image = "image",
  youtube = "youtube",
}
export enum BannerActionType {
  WEBSITE = "WEBSITE", // Mở 1 đường dẫn
  PRODUCT = "PRODUCT", // Mở 1 sản phẩm
  VOUCHER = "VOUCHER", // Mở 1 voucher
  SHOP = "SHOP", // Cửa hàng
}
export type ShopBanner = {
  type?: ShopBannerType; // Loại banner
  image?: string; // Hình ảnh
  title?: string; // Tiêu đề
  subtitle?: string; // Mô tả tiêu đề
  actionType?: BannerActionType; // Loại hành động
  link?: string; // Đường dẫn website
  productId?: string; // Mã sản phẩm
  voucherId?: string; // Mã voucher
  isPublic?: boolean; // Hiển thị công khai
  youtubeLink?: string; // Link youtube
};
export const ShopBannerSchema = new Schema({
  type: { type: String, enum: Object.values(ShopBannerType), default: ShopBannerType.image },
  image: { type: String },
  title: { type: String },
  subtitle: { type: String },
  actionType: { type: String, enum: Object.values(BannerActionType), required: true },
  link: { type: String },
  productId: { type: String },
  voucherId: { type: String },
  isPublic: { type: Boolean, default: false },
  youtubeLink: { type: String },
});
export default {
  schema: gql`
    type  ShopBanner {
      "Loại banner ${Object.values(ShopBannerType)}"
      type: String
      "Hình ảnh"
      image: String
      "Tiêu đề"
      title: String
      "Mô tả tiêu đề"
      subtitle: String
      "Loại hành động ${Object.values(BannerActionType)}"
      actionType: String
      "Đường dẫn website"
      link: String
      "Mã sản phẩm"
      productId: ID
      "Mã voucher"
      voucherId: ID
      "Hiển thị công khai"
      isPublic: Boolean
      "Link youtube"
      youtubeLink: String

      product: Product
      voucher: ShopVoucher
    }
    input ShopBannerInput {
      "Loại banner ${Object.values(ShopBannerType)}"
      type: String
      "Hình ảnh"
      image: String!
      "Tiêu đề"
      title: String
      "Mô tả tiêu đề"
      subtitle: String
      "Loại hành động ${Object.values(BannerActionType)}"
      actionType: String!
      "Đường dẫn website"
      link: String
      "Mã sản phẩm"
      productId: ID
      "Mã voucher"
      voucherId: ID
      "Hiển thị công khai"
      isPublic: Boolean
      "Link youtube"
      youtubeLink: String
    }
    extend type ShopConfig {
      banners: [ShopBanner]
    }
    extend input UpdateShopConfigInput {
      banners: [ShopBannerInput]
    }
  `,
  resolver: {
    ShopBanner: {
      product: GraphQLHelper.loadById(ProductLoader, "productId"),
      voucher: GraphQLHelper.loadById(ShopVoucherLoader, "voucherId"),
    },
  },
};
