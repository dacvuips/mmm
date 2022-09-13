import { gql } from "apollo-server-express";
import { SupportTicketStatus, SupportTicketSubStatus } from "./common";

const schema = gql`
  extend type Query {
    getAllSupportTicket(q: QueryGetListInput): SupportTicketPageData
    getOneSupportTicket(id: ID!): SupportTicket
    # Add Query
  }

  extend type Mutation {
    createSupportTicket(data: CreateSupportTicketInput!): SupportTicket
    updateSupportTicket(id: ID!, data: UpdateSupportTicketInput!): SupportTicket
    deleteOneSupportTicket(id: ID!): SupportTicket
    # Add Mutation
  }

  input CreateSupportTicketInput {
    "Nội dung yêu cầu"
    name: String!
    "Mô tả chi tiết"
    desc: String
    "Danh sách hình ảnh"
    images: [String]
  }

  input UpdateSupportTicketInput {
    "Nội dung yêu cầu"
    name: String
    "Mô tả chi tiết"
    desc: String
    "Danh sách hình ảnh"
    images: [String]
  }

  type SupportTicket {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã yêu cầu"
    code: String
    "Mã chủ shop"
    memberId: ID
    "Nội dung yêu cầu"
    name: String
    "Mô tả chi tiết"
    desc: String
    "Danh sách hình ảnh"
    images: [String]
    "Trạng thái xử lý ${Object.values(SupportTicketStatus)}"
    status: String
    "Chi tiết trạng thái ${Object.values(SupportTicketSubStatus)}"
    subStatus: String
    "Lịch sử"
    logs: [Mixed]
    "Nhân sự phụ trách"
    assignerId: ID

    member: Member
    assigner: User
  }

  type SupportTicketPageData {
    data: [SupportTicket]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
