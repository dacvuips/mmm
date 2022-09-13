import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopSaleFeedGroup(q: QueryGetListInput): ShopSaleFeedGroupPageData
    getOneShopSaleFeedGroup(id: ID!): ShopSaleFeedGroup
    # Add Query
  }

  extend type Mutation {
    createShopSaleFeedGroup(data: CreateShopSaleFeedGroupInput!): ShopSaleFeedGroup
    updateShopSaleFeedGroup(id: ID!, data: UpdateShopSaleFeedGroupInput!): ShopSaleFeedGroup
    deleteOneShopSaleFeedGroup(id: ID!): ShopSaleFeedGroup
    # Add Mutation
  }

  input CreateShopSaleFeedGroupInput {
    name: String
  }

  input UpdateShopSaleFeedGroupInput {
    name: String
  }

  type ShopSaleFeedGroup {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
  }

  type ShopSaleFeedGroupPageData {
    data: [ShopSaleFeedGroup]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
