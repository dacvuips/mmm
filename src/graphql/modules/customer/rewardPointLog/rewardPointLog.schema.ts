import { gql } from "apollo-server-express";
import { RewardPointLogType } from "./rewardPointLog.model";

const schema = gql`
  extend type Query {
    getAllRewardPointLog(q: QueryGetListInput): RewardPointLogPageData
    getOneRewardPointLog(id: ID!): RewardPointLog
    # Add Query
  }


  type RewardPointLog {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
    "Loại điểm ${Object.values(RewardPointLogType)}"
    type: String
    "Giá trị"
    value: Int
    "Đữ liệu kèm theo"
    meta: Mixed

    member: Member
    customer: Customer
  }

  type RewardPointLogPageData {
    data: [RewardPointLog]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
