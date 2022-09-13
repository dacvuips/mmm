import { gql } from "apollo-server-express";
import { DisburseItemStatus } from "./disburseItem.model";

const schema = gql`
  extend type Query {
    getAllDisburseItem(q: QueryGetListInput): DisburseItemPageData
    getOneDisburseItem(id: ID!): DisburseItem
    # Add Query
  }

  extend type Mutation {
    createDisburseItem(data: CreateDisburseItemInput!): DisburseItem
    deleteOneDisburseItem(id: ID!): DisburseItem
    # Add Mutation
  }

  input CreateDisburseItemInput {
    "Mã giải ngân"
    disburseId: ID
    "Mã chủ shop"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
    "Mã chủ shop"
    customerCode: String
    "Điện thoại chủ shop"
    customerPhone: String
    "Tên chủ shop"
    customerName: String
    "Mã chủ shop"
    memberCode: String
    "Điện thoại chủ shop"
    memberPhone: String
    "Tên chủ shop"
    memberName: String
    "CMND"
    idCard: String
    "Giá trị giải ngân"
    value: Float
  }

  type DisburseItem {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã giải ngân"
    disburseId: ID
    "Mã chủ shop"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
    "Mã chủ shop"
    customerCode: String
    "Điện thoại chủ shop"
    customerPhone: String
    "Tên chủ shop"
    customerName: String
    "Giá trị giải ngân"
    value: Float
    "Trạng thái ${Object.values(DisburseItemStatus)}"
    status: String
    "Dữ liệu kèm theo"
    meta: Mixed
    "Mã đợt chi"
    payoutId: ID

    member: Member
    customer: Customer
  }

  type DisburseItemPageData {
    data: [DisburseItem]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
