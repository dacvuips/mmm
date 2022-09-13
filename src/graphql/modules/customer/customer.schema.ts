import { gql } from "apollo-server-express";
import { Gender } from "../member/member.model";

const schema = gql`
  extend type Query {
    getAllCustomer(q: QueryGetListInput): CustomerPageData
    getOneCustomer(id: ID!): Customer
    customerGetMe: Customer
  }

  extend type Mutation {
    loginCustomerByToken(idToken: String!, psid: String, pageId: String): CustomerLoginData
    customerUpdateMe(data: CustomeUpdateMeInput!): Customer
  }

  input CustomeUpdateMeInput {
    name: String
    address: String
    phone: String
    "Email"
    email: String
    "Số chứng minh nhân dân"
    idCard: String
    provinceId: String
    districtId: String
    wardId: String
    avatar: String
    gender: String,
    latitude: Float,
    longitude: Float,
    "Full địa chỉ"
    fullAddress: String
    "Ghi chú địa chỉ"
    addressNote: String
    "Ngày sinh"
    birthday: DateTime
  }

  type Customer {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Shop"
    member: Member
    "Mã khách hàng"
    code: String
    "Tên khách hàng"
    name: String
    "Tên facebook"
    facebookName: String
    "UID Firebase"
    uid: String
    "Số điện thoại"
    phone: String
    "Email"
    email: String
    "Số chứng minh nhân dân"
    idCard: String
    "Avatar"
    avatar: String
    "Giới tính ${Object.values(Gender)}"
    gender: String
    "Ngày sinh"
    birthday: DateTime
    "Địa chỉ"
    address: String
    "Full địa chỉ"
    fullAddress: String
    "Ghi chú địa chỉ"
    addressNote: String
    "Tỉnh / thành"
    province: String
    "Quận / huyện"
    district: String
    "Phường / xã"
    ward: String
    "Mã Tỉnh / thành"
    provinceId: String
    "Mã Quận / huyện"
    districtId: String
    "Mã Phường / xã"
    wardId: String
    "Điểm tích lũy"
    cumulativePoint: Float
    "Hoa hồng cộng tác viên"
    commission: Float
    "Danh sách account facebook của người dùng"
    pageAccounts: [CustomerPageAccount]
    "Là cộng tác viên"
    isCollaborator: Boolean
    "Danh sách shop đang cộng tác "
    collaboratorShops: [Member]
    collaboratorId: ID
    "Cộng tác viên"
    collaborator: Collaborator
    "Mã người giới thiệu"
    presenterId: ID
    "KH Giới thiệu"
    presenter: Customer
    "Người dùng subscriber"
    manychatSubscriber: Mixed
    "Mã PSID Facebook"
    psid: String
    "Mã follower Zalo"
    followerId: String
    "Người dùng Zalo"
    zaloFollower: Mixed
    "Mã global customer"
    globalCustomerId: String,
    latitude: Float,
    longitude: Float,
  }

  type CustomerPageAccount {
    "PSID người dùng"
    psid: String
    "ID của Fanpage"
    pageId: String
    "Mã thành viên"
    memberId: ID

    member: Member
  }

  type CustomerPageData {
    data: [Customer]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
