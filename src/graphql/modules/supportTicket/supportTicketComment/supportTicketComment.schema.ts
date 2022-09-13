import { gql } from "apollo-server-express";
import { SupportTicketStatus, SupportTicketSubStatus } from "../common";

const schema = gql`
  extend type Query {
    getAllSupportTicketComment(q: QueryGetListInput): SupportTicketCommentPageData
    getOneSupportTicketComment(id: ID!): SupportTicketComment
    # Add Query
  }

  extend type Mutation {
    createSupportTicketComment(data: CreateSupportTicketCommentInput!): SupportTicketComment
    updateSupportTicketComment(
      id: ID!
      data: UpdateSupportTicketCommentInput!
    ): SupportTicketComment
    deleteOneSupportTicketComment(id: ID!): SupportTicketComment
    # Add Mutation
  }

  input CreateSupportTicketCommentInput {
    "Mã yêu cầu"
    ticketId: ID!
    "Nội dung"
    message: String!
    "Hình ảnh"
    images: [String]
  }

  input UpdateSupportTicketCommentInput {
    "Nội dung"
    message: String
    "Hình ảnh"
    images: [String]
  }

  type SupportTicketComment {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã yêu cầu"
    ticketId: ID
    "Bình luận từ chủ shop"
    fromMember: Boolean
    "Mã chủ shop"
    memberId: ID
    "Mã người dùng"
    userId: ID
    "Tên"
    name: String
    "Nội dung"
    message: String
    "Hình ảnh"
    images: [String]

    member: Member
    user: User
  }

  type SupportTicketCommentPageData {
    data: [SupportTicketComment]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
