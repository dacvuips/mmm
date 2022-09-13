import { gql } from "apollo-server-express";
import { Plan } from "../subscription.model";

const schema = gql`
  extend type Query {
    getAllSubscriptionRequest(q: QueryGetListInput): SubscriptionRequestPageData
    getOneSubscriptionRequest(id: ID!): SubscriptionRequest
    # Add Query
  }

  extend type Mutation {
    createSubscriptionRequest(data: CreateSubscriptionRequestInput!): SubscriptionRequest
  }

  input CreateSubscriptionRequestInput {
    "Gói yêu cầu ${Object.values([Plan.FREE, Plan.BASIC, Plan.PROFESSIONAL])}"
    plan: String!
    "Số tháng đăng ký"
    months: Int
    "Số ngày đăng ký"
    days: Int
  }

  type SubscriptionRequest {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Tên yêu cầu"
    name: String
    "Số tháng đăng ký"
    months: Int
    "Số ngày đăng ký"
    days: Int
    "Gói yêu cầu ${Object.values(Plan)}"
    plan: String
    "Số tiền thanh toán"
    amount: Float
    "Thời gian hết hạn"
    expiredAt: DateTime
    "Thanh toán"
    payment: Payment
  }

  type SubscriptionRequestPageData {
    data: [SubscriptionRequest]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
