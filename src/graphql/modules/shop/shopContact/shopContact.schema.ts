import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopContact(q: QueryGetListInput): ShopContactPageData
    getOneShopContact(id: ID!): ShopContact
    # Add Query
  }

  extend type Mutation {
    createShopContact(data: CreateShopContactInput!): ShopContact
    # updateShopContact(id: ID!, data: UpdateShopContactInput!): ShopContact
    # deleteOneShopContact(id: ID!): ShopContact
    # Add Mutation
  }

  input CreateShopContactInput {
    "Họ và tên"
    name: String
    "tên công ty"
    company: String
    "email"
    email: String!
    "Thời gian nghe máy"
    avalableTime: String
    "Tin nhắn"
    message: String
    "Mã cửa hàng"
    memberId: ID!
  }

  # input UpdateShopContactInput {
  #   name: String
  # }

  type ShopContact {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Họ và tên"
    name: String
    "tên công ty"
    company: String
    "email"
    email: String
    "Thời gian nghe máy"
    avalableTime: String
    "Tin nhắn"
    message: String
    "Mã cửa hàng"
    memberId: ID
    "Cửa hàng"
    member: Member
  }

  type ShopContactPageData {
    data: [ShopContact]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
