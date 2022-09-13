import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopTable(q: QueryGetListInput): ShopTablePageData
    getOneShopTable(id: ID!): ShopTable
    getOneShopTableByCode(code: String!): ShopTable
    # Add Query
  }

  extend type Mutation {
    createShopTable(data: CreateShopTableInput!): ShopTable
    updateShopTable(id: ID!, data: UpdateShopTableInput!): ShopTable
    deleteOneShopTable(id: ID!): ShopTable
    # Add Mutation
  }

  input CreateShopTableInput {
    name: String!
    code: String
    "Id chi nhanh"
    branchId: ID!
  }

  input UpdateShopTableInput {
    name: String
    code: String
    "Id chi nhanh"
    branchId: ID
  }

  type ShopTable {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    code: String
    "* Id cua hang"
    memberId: ID
    "Id chi nhanh"
    branchId: ID

    member: Member
    branch: Branch
    pickupUrl: String
  }

  type ShopTablePageData {
    data: [ShopTable]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
