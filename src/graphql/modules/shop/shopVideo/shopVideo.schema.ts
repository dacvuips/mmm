import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopVideo(q: QueryGetListInput): ShopVideoPageData
    getOneShopVideo(id: ID!): ShopVideo
    # Add Query
  }

  extend type Mutation {
    createShopVideo(data: CreateShopVideoInput!): ShopVideo
    updateShopVideo(id: ID!, data: UpdateShopVideoInput!): ShopVideo
    deleteOneShopVideo(id: ID!): ShopVideo
    # Add Mutation
  }

  input CreateShopVideoInput {
    "Tên video"
    name: String
    "Link video"
    link: String
    "Link thumbnail"
    thumbnail: String
    "Mô tả"
    description: String
    "Kích hoạt"
    active: Boolean
    "Ưu tiên"
    priority: Int
  }

  input UpdateShopVideoInput {
    "Tên video"
    name: String
    "Link video"
    link: String
    "Link thumbnail"
    thumbnail: String
    "Mô tả"
    description: String
    "Kích hoạt"
    active: Boolean
    "Ưu tiên"
    priority: Int
  }

  type ShopVideo {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã cửa hàng"
    memberId: ID
    "Tên video"
    name: String
    "Link video"
    link: String
    "Link thumbnail"
    thumbnail: String
    "Mô tả"
    description: String
    "Kích hoạt"
    active: Boolean
    "Ưu tiên"
    priority: Int
  }

  type ShopVideoPageData {
    data: [ShopVideo]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
