import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllAdminNotification(q: QueryGetListInput): AdminNotificationPageData
    getOneAdminNotification(id: ID!): AdminNotification

    # Add Query
  }
  extend type Mutation {
    createAdminNotification(data: CreateAdminNotificationInput!): AdminNotification
    updateAdminNotification(id: ID!, data: UpdateAdminNotificationInput!): AdminNotification
    deleteOneAdminNotification(id: ID!): AdminNotification
    # Add Mutation
  }
  input CreateAdminNotificationInput {
    "Tiêu đề"
    title: String!
    "Tin nhắn"
    body: String!
    "Hình ảnh"
    image: String
    "Hành động khi click"
    action: ActionInput
  }
  input UpdateAdminNotificationInput {
    "Tiêu đề"
    title: String
    "Tin nhắn"
    body: String
    "Hình ảnh"
    image: String
    "Hành động khi click"
    action: ActionInput
  }
  type AdminNotification {
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    "Tiêu đề"
    title: String
    "Tin nhắn"
    body: String
    "Hình ảnh"
    image: String
    "Lịch sử gửi"
    logs: [NotifySendLog]
    "Hành động khi click"
    action: Action
  }
  type AdminNotificationPageData {
    data: [AdminNotification]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
