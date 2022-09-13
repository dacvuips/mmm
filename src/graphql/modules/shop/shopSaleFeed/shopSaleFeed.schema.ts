import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopSaleFeed(q: QueryGetListInput): ShopSaleFeedPageData
    getOneShopSaleFeed(id: ID!): ShopSaleFeed
    # Add Query
  }

  extend type Mutation {
    createShopSaleFeed(data: CreateShopSaleFeedInput!): ShopSaleFeed
    updateShopSaleFeed(id: ID!, data: UpdateShopSaleFeedInput!): ShopSaleFeed
    deleteOneShopSaleFeed(id: ID!): ShopSaleFeed
    # Add Mutation
  }

  input CreateShopSaleFeedInput {
    "Tên bản tin"
    name: String!
    "Mô tả ngắn"
    snippet: String
    "Hướng dẫn"
    tips: String
    "Nội dung"
    contents: [SaleFeedContentInput]!
    "Mã sản phẩm"
    productId: ID!
    "Trạng thái"
    active: Boolean
    "Ưu tiên"
    priority: Int
    "Hiển thị trên marketplace"
    showOnMarketPlace: Boolean
  }

  input UpdateShopSaleFeedInput {
    "Tên bản tin"
    name: String
    "Mô tả ngắn"
    snippet: String
    "Hướng dẫn"
    tips: String
    "Nội dung"
    contents: [SaleFeedContentInput]
    "Mã sản phẩm"
    productId: ID
    "Trạng thái"
    active: Boolean
    "Ưu tiên"
    priority: Int
    "Hiển thị trên marketplace"
    showOnMarketPlace: Boolean
  }

  type ShopSaleFeed {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã member"
    memberId: ID
    "Tên bản tin"
    name: String
    "Mô tả ngắn"
    snippet: String
    "Hướng dẫn"
    tips: String
    "Nội dung"
    contents: [SaleFeedContent]
    "Mã sản phẩm"
    productId: ID
    "Trạng thái"
    active: Boolean
    "Ưu tiên"
    priority: Int
    "Hiển thị trên marketplace"
    showOnMarketPlace: Boolean

    product: Product
    images: [String]
    shareLink: String
  }

  type ShopSaleFeedPageData {
    data: [ShopSaleFeed]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
