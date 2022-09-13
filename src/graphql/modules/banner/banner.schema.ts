import { gql } from "apollo-server-express";
import { BannerActionType } from "../shop/shopConfig/shopBanner.graphql";

const schema = gql`
  extend type Query {
    getAllBanner(q: QueryGetListInput): BannerPageData
    getOneBanner(id: ID!): Banner
    # Add Query
  }

  extend type Mutation {
    createBanner(data: CreateBannerInput!): Banner
    updateBanner(id: ID!, data: UpdateBannerInput!): Banner
    deleteOneBanner(id: ID!): Banner
    # Add Mutation
  }

  input CreateBannerInput {
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
    "Ưu tiên"
    priority: Int
    "Mã cửa hàng "
    memberId: ID
    "Vị trí"
    position:String
  }

  input UpdateBannerInput {
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
    "Ưu tiên"
    priority: Int
    "Mã cửa hàng "
    memberId: ID
    "Vị trí"
    position:String
  }

  type Banner {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

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
    "Ưu tiên"
    priority: Int
    "Mã cửa hàng "
    memberId: ID
    "Vị trí"
    position:String

    shop: Shop
    product: Product
    voucher: ShopVoucher
  }

  type BannerPageData {
    data: [Banner]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
