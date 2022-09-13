import { gql } from "apollo-server-express";
import { Plan } from "./subscription.model";

const schema = gql`
  extend type Query {
    getAllShopSubscription(q: QueryGetListInput): ShopSubscriptionPageData
    # Add Query
  }

  type ShopSubscription {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Gói dịch vụ ${Object.values(Plan)}"
    plan: String
    "Ngày hết hạn"
    expiredAt: DateTime
    "Ngày nhắc nhở hết hạn"
    remindExpiredAt: DateTime
    "Ngày nhắc nhở khoá"
    remindLockAt: DateTime
    "Ngày khoá"
    lockedAt: DateTime
    "Phí dịch vụ"
    fee: Float
    "Mã yêu cầu đăng ký"
    requestId: ID

    request: SubscriptionRequest
  }

  type ShopSubscriptionPageData {
    data: [ShopSubscription]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
