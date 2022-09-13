import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopPostTag(q: QueryGetListInput): ShopPostTagPageData
    getOneShopPostTag(id: ID!): ShopPostTag
    # Add Query
  }

  extend type Mutation {
    createShopPostTag(data: CreateShopPostTagInput!): ShopPostTag
    updateShopPostTag(id: ID!, data: UpdateShopPostTagInput!): ShopPostTag
    deleteOneShopPostTag(id: ID!): ShopPostTag
    # Add Mutation
  }

  input CreateShopPostTagInput {
    "Tên tag"
    name: String!
    "Từ khoá"
    slug: String
    "Mô tả"
    description: String
    "Mã màu"
    accentColor: String
    "Hình ảnh đại diện"
    featureImage: String
  }

  input UpdateShopPostTagInput {
    "Tên tag"
    name: String
    "Từ khoá"
    slug: String
    "Mô tả"
    description: String
    "Mã màu"
    accentColor: String
    "Hình ảnh đại diện"
    featureImage: String
  }

  type ShopPostTag {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Id của member"
    memberId: ID
    "Tên tag"
    name: String
    "Từ khoá"
    slug: String
    "Mô tả"
    description: String
    "Mã màu"
    accentColor: String
    "Hình ảnh đại diện"
    featureImage: String
  }

  type ShopPostTagPageData {
    data: [ShopPostTag]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
