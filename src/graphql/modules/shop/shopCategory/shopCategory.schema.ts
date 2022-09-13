import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopCategory(q: QueryGetListInput): ShopCategoryPageData
    getOneShopCategory(id: ID!): ShopCategory
    # Add Query
  }

  extend type Mutation {
    createShopCategory(data: CreateShopCategoryInput!): ShopCategory
    updateShopCategory(id: ID!, data: UpdateShopCategoryInput!): ShopCategory
    deleteOneShopCategory(id: ID!): ShopCategory
    # Add Mutation
  }

  input CreateShopCategoryInput {
    "Tên phân loại"
    name: String!
    "Hình ảnh"
    image: String
    "Mô tả"
    desc: String
    "Ưu tiên"
    priority: Int
  }

  input UpdateShopCategoryInput {
    "Tên phân loại"
    name: String
    "Hình ảnh"
    image: String
    "Mô tả"
    desc: String
    "Ưu tiên"
    priority: Int
  }

  type ShopCategory {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Tên phân loại"
    name: String
    "Hình ảnh"
    image: String
    "Mô tả"
    desc: String
    "Ưu tiên"
    priority: Int
  }

  type ShopCategoryPageData {
    data: [ShopCategory]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
