import { gql } from "apollo-server-express";
import { DisburseStatus } from "./disburse.model";

const schema = gql`
  extend type Query {
    getAllDisburse(q: QueryGetListInput): DisbursePageData
    getOneDisburse(id: ID!): Disburse
    # Add Query
  }

  extend type Mutation {
    createDisburse(data: CreateDisburseInput!): Disburse
    updateDisburse(id: ID!, data: UpdateDisburseInput!): Disburse
    deleteOneDisburse(id: ID!): Disburse
    # Add Mutation
  }

  input CreateDisburseInput {
    "Mã cửa hàng"
    memberId: ID!
    "Đợt giải ngân"
    name: String!
    "từ ngày"
    startDate: DateTime!
    "đến ngày"
    endDate: DateTime!
    "Ghi chú"
    note: String
  }

  input UpdateDisburseInput {
    "Đợt giải ngân"
    name: String
    "Ghi chú"
    note: String
  }

  type Disburse {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã cửa hàng"
    memberId: ID
    "Đợt giải ngân"
    name: String
    "từ ngày"
    startDate: DateTime
    "đến ngày"
    endDate: DateTime
    "Trạng thái ${Object.values(DisburseStatus)}"
    status: String
    "Ghi chú"
    note: String
    "Người mở đợt giải ngân"
    ownerId: ID
    "Người đóng đợt giải ngân"
    closeById: ID
    "Ngày đóng"
    closeAt: DateTime

    owner: User
    closeBy: User
    member: Member
  }

  type DisbursePageData {
    data: [Disburse]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
