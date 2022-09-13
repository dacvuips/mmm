import { gql } from "apollo-server-express";
import { approvalStatus } from "../../../../../constants/approveStatus";

const schema = gql`
  extend type Query {
    getAllWithdrawRequest(q: QueryGetListInput): WithdrawRequestPageData
    getOneWithdrawRequest(id: ID!): WithdrawRequest
    # Add Query
  }

  extend type Mutation {
    createWithdrawRequest(data: CreateWithdrawRequestInput!): WithdrawRequest
    updateWithdrawRequest(id: ID!, data: UpdateWithdrawRequestInput!): WithdrawRequest
    # Add Mutation
  }

  input CreateWithdrawRequestInput {
    "Giá trị"
    value: Float!
  }

  input UpdateWithdrawRequestInput {
    "Trạng thái yêu cầu ${Object.keys(approvalStatus)}"
    status: String!,
    "Lí do từ chối"
    rejectedReason: String,
  }

  type WithdrawRequest {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: String,
    "Trạng thái yêu cầu ${Object.keys(approvalStatus)}"
    status: String,    
    "Giá trị"
    value:Float,
    "Ngày duyệt"
    approvedAt: DateTime,
    "Ngày từ chối"
    rejectedAt: DateTime,
    "Lí do từ chối"
    rejectedReason: String,
    "Mã người duyệt"
    userId: String,

    member: Member,
    user: User,
  }

  type WithdrawRequestPageData {
    data: [WithdrawRequest]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
