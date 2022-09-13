import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopTopic(q: QueryGetListInput): ShopTopicPageData
    getOneShopTopic(id: ID!): ShopTopic
    # Add Query
  }

  extend type Mutation {
    createShopTopic(data: CreateShopTopicInput!): ShopTopic
    updateShopTopic(id: ID!, data: UpdateShopTopicInput!): ShopTopic
    deleteOneShopTopic(id: ID!): ShopTopic
    # Add Mutation
  }

  input CreateShopTopicInput {
    "Tên chủ đề"
    name: String!
    "slug"
    slug: String
    "Hình ảnh"
    image: String
    "Nhóm"
    group: String
  }

  input UpdateShopTopicInput {
    "Tên chủ đề"
    name: String
    "slug"
    slug: String
    "Hình ảnh"
    image: String
    "Nhóm"
    group: String
  }

  type ShopTopic {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã thành viên"
    memberId: ID
    "Tên chủ đề"
    name: String
    "slug"
    slug: String
    "Hình ảnh"
    image: String
    "Nhóm"
    group: String
  }

  type ShopTopicPageData {
    data: [ShopTopic]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
