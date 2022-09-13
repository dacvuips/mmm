import { gql } from "apollo-server-express";
import { Gender } from "../../member/member.model";

const schema = gql`
  extend type Query {
    getAllGlobalCustomer(q: QueryGetListInput): GlobalCustomerPageData
    getOneGlobalCustomer(id: ID!): GlobalCustomer
    # Add Query
  }

  extend type Mutation {
    createGlobalCustomer(data: CreateGlobalCustomerInput!): GlobalCustomer
    loginGlobalCustomerByPhone(idToken: String!, deviceId: String, deviceToken: String): GlobalCustomerLoginData
    
    updateGlobalCustomer(id: ID!, data: UpdateGlobalCustomerInput!): GlobalCustomer
    deleteOneGlobalCustomer(id: ID!): GlobalCustomer
    # Add Mutation
  }

  input CreateGlobalCustomerInput {
    "Mã khách hàng"
    code: String
    "Tên khách hàng"
    name: String
    "Số điện thoại"
    phone: String!
    "Email"
    email: String
    "Ảnh đại diện"
    avatar: String
    "Giới tính ${Object.values(Gender)}"
    gender: String
    "Ngày sinh"
    birthday: DateTime
    "Full địa chỉ"
    fullAddress: String
    latitude: Float
    longitude: Float
    "danh sách customerid"
    customerIds: [String]
  }

  input UpdateGlobalCustomerInput {
    "Mã khách hàng"
    code: String
    "Tên khách hàng"
    name: String
    "Số điện thoại"
    phone: String!
    "Email"
    email: String
    "Ảnh đại diện"
    avatar: String
    "Giới tính ${Object.values(Gender)}"
    gender: String
    "Ngày sinh"
    birthday: DateTime
    "Full địa chỉ"
    fullAddress: String
    latitude: Float
    longitude: Float
    "danh sách customerid"
    customerIds: [String]
  }

  type GlobalCustomer {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã khách hàng"
    code: String
    "Tên khách hàng"
    name: String
    "Số điện thoại"
    phone: String
    "Email"
    email: String
    "Ảnh đại diện"
    avatar: String
    "Giới tính ${Object.values(Gender)}"
    gender: String
    "Ngày sinh"
    birthday: DateTime
    "Full địa chỉ"
    fullAddress: String
    latitude: Float
    longitude: Float

    "danh sách customerid"
    customerIds: [String]
  }

  type GlobalCustomerPageData {
    data: [GlobalCustomer]
    total: Int
    pagination: Pagination
  }

  type GlobalCustomerLoginData {
    globalCustomer: GlobalCustomer
    token: String
  }
`;

export default schema;
