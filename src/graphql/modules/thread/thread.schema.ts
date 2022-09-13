import { gql } from "apollo-server-express";
import { ThreadChannel, ThreadStatus } from "./thread.type";

const schema = gql`
  extend type Query {
    getAllThread(q: QueryGetListInput): ThreadPageData
    getOneThread(id: ID!): Thread
    # Add Query
  }

  extend type Mutation {
    createThread(data: CreateThreadInput!): Thread
    updateThread(id: ID!, data:UpdateThreadInput!): Thread
    # Add Mutation
  }

  input CreateThreadInput {
    "Kênh trao đổi ${Object.values(ThreadChannel)}"
    channel: String
    "Mã chủ shop"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
  }

  input UpdateThreadInput{
    "Danh sách mã nhãn"
    threadLabelIds: [ID]
  }

  type Thread {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Kênh trao đổi ${Object.values(ThreadChannel)}"
    channel: String 
    "Tin nhắn gần nhất"
    snippet: String
    "Thời điểm tin nhắn gần nhất"
    lastMessageAt: DateTime
    "Mã tin nhắn gần nhất"
    messageId: ID
    "Mã chủ shop"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
    "Mã quản lý"
    userId: ID
    "Trạng thái trao đổi ${Object.values(ThreadStatus)}"
    status: String
    "Đã xem"
    seen: Boolean
    "Ngày xem gần nhất"
    seenAt: DateTime
    "Danh sách mã nhãn"
    threadLabelIds: [ID]

    member: Member
    customer: Customer
    user: User
    message: ThreadMessage
    threadLabels: [ThreadLabel]
  }

  type ThreadPageData {
    data: [Thread]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
