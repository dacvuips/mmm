import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllTriggerGroup(q: QueryGetListInput): TriggerGroupPageData
    getOneTriggerGroup(id: ID!): TriggerGroup
    # Add Query
  }

  extend type Mutation {
    createTriggerGroup(data: CreateTriggerGroupInput!): TriggerGroup
    updateTriggerGroup(id: ID!, data: UpdateTriggerGroupInput!): TriggerGroup
    deleteOneTriggerGroup(id: ID!): TriggerGroup
    # Add Mutation
  }

  input CreateTriggerGroupInput {
    "Tên nhóm trigger"
    name: String!
    "Mô tả"
    description: String
    "Danh sách trigger"
    triggerIds: [ID]
  }

  input UpdateTriggerGroupInput {
    "Tên nhóm trigger"
    name: String
    "Mô tả"
    description: String
    "Danh sách trigger"
    triggerIds: [ID]
  }

  type TriggerGroup {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Tên nhóm trigger"
    name: String
    "Mô tả"
    description: String
    "Danh sách trigger"
    triggerIds: [ID]
  }

  type TriggerGroupPageData {
    data: [TriggerGroup]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
