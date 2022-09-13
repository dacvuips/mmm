import { gql } from "apollo-server-express";
import { DisbursePayoutStatus } from "./disbursePayout.model";

const schema = gql`
  extend type Query {
    getAllDisbursePayout(q: QueryGetListInput): DisbursePayoutPageData
    getOneDisbursePayout(id: ID!): DisbursePayout
    # Add Query
  }

  extend type Mutation {
    createDisbursePayout(data: CreateDisbursePayoutInput!): DisbursePayout
    deleteOneDisbursePayout(id: ID!): DisbursePayout
    # Add Mutation
  }

  input CreateDisbursePayoutInput {
    "Mã đợt giải ngân"
    disburseId: ID!
    "Tên đợt chi"
    name: String!
  }

  type DisbursePayout {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã cửa hàng"
    memberId: ID
    "Mã đợt giải ngân"
    disburseId: ID
    "Người tạo"
    ownerId: ID
    "Người duyệt"
    approverId: ID
    "Ngày duyệt hoặc Ngày huỷ"
    approveAt: DateTime
    "Tên đợt chi"
    name: String
    "Tổng số tiền chi"
    amount: Float
    "Số giao dịch"
    transactionCount: Int
    "Số giao dịch thành công"
    successCount: Int
    "Số tiên chi thành công"
    successAmount: Float
    "Số giao dịch thất bại"
    failedCount: Int
    "Trạng thái chi ${Object.values(DisbursePayoutStatus)}"
    status: String
    "Nội dung đang xử lý"
    processingMsg: String
    "Dữ liệu kèm theo"
    meta: Mixed
  }

  type DisbursePayoutPageData {
    data: [DisbursePayout]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
