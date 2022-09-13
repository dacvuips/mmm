import { gql } from "apollo-server-express";
import { CommissionLogType } from "./commissionLog.model";

const schema = gql`
  extend type Query {
    getAllCommissionLog(q: QueryGetListInput): CommissionLogPageData
  }

  extend type Mutation {
    disburseCommission(data: CreateCommissionLogInput!): CommissionLog
  }

  input CreateCommissionLogInput{
    "Mã khách hàng"
    customerId: String !
    "Giá trị"
    value: Float!
    "Loại sự kiện ${[
      CommissionLogType.DISBURSE_COMMISSION_MOMO,
      CommissionLogType.DISBURSE_COMMISSION_MANUAL,
    ]}"
    type: String!
    "Nội dung chi"
    content: String!
    "Hình ảnh kèm theo"
    attachments: [String]
  }

  type CommissionLog {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã thành viên"
    memberId: ID
    "Mã khách hàng"
    customerId: ID
    "Giá trị"
    value: Float
    "Loại sự kiện ${Object.values(CommissionLogType)}"
    type: String
    "Mã đơn hàng"
    orderId: ID
    "Mã đăng ký SMS"
    regisSMSId: ID
    "Mã đăng ký dịch vụ"
    regisServiceId: ID
    "Ghi chú"
    note: String
    "Mã đợt giải ngân"
    disburseId: ID
    "Mã chi"
    disburseItemId: ID
    "Nội dung chi"
    content: String
    "Hình ảnh gửi kèm"
    attachments: [String]

        
    order: Order
    regisSMS: RegisSMS
    regisService: RegisService
    member: Member
  }

  type CommissionLogPageData {
    data: [CommissionLog]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
