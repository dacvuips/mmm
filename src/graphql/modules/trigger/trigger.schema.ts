import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllTrigger(q: QueryGetListInput): TriggerPageData
    getOneTrigger(id: ID!): Trigger
    # Add Query
  }

  extend type Mutation {
    createTrigger(data: CreateTriggerInput!): Trigger
    updateTrigger(id: ID!, data: UpdateTriggerInput!): Trigger
    deleteOneTrigger(id: ID!): Trigger
    # Add Mutation
  }

  input CreateTriggerInput {
    "Mã trigger"
    code: String
    "Tên trigger"
    name: String!
    "Kích hoạt"
    active: Boolean
    "Sự kiện kích hoạt"
    event: String
    "Hành động"
    actions: [Mixed]
    "Nhóm trigger"
    triggerGroupId: ID!
  }

  input UpdateTriggerInput {
    "Mã trigger"
    code: String
    "Tên trigger"
    name: String
    "Kích hoạt"
    active: Boolean
    "Sự kiện kích hoạt"
    event: String
    "Hành động"
    actions: [Mixed]
    "Nhóm trigger"
    triggerGroupId: ID
  }

  type Trigger {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã cửa hàng"
    memberId: ID
    "Mã trigger"
    code: String
    "Tên trigger"
    name: String
    "Kích hoạt"
    active: Boolean
    "Sự kiện kích hoạt"
    event: String
    "Hành động"
    actions: [Mixed]
    "Nhóm trigger"
    triggerGroupId: ID

    "Nhóm trigger"
    triggerGroup: TriggerGroup
  }

  type TriggerPageData {
    data: [Trigger]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
