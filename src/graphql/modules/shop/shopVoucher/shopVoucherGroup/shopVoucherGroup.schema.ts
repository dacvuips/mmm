import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopVoucherGroup(q: QueryGetListInput): ShopVoucherGroupPageData
    getOneShopVoucherGroup(id: ID!): ShopVoucherGroup
    # Add Query
  }

  extend type Mutation {
    createShopVoucherGroup(data: CreateShopVoucherGroupInput!): ShopVoucherGroup
    updateShopVoucherGroup(id: ID!, data: UpdateShopVoucherGroupInput!): ShopVoucherGroup
    deleteOneShopVoucherGroup(id: ID!): ShopVoucherGroup
    # Add Mutation
  }

  input CreateShopVoucherGroupInput {
    "Tên nhóm voucher"
    name: String!
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  input UpdateShopVoucherGroupInput {
    "Tên nhóm voucher"
    name: String
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  type ShopVoucherGroup {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Tên nhóm voucher"
    name: String
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  type ShopVoucherGroupPageData {
    data: [ShopVoucherGroup]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
