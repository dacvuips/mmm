import { gql } from "apollo-server-express";
import { CustomerContactStatus } from "./customerContact.model";

const schema = gql`
  extend type Query {
    getAllCustomerContact(q: QueryGetListInput): CustomerContactPageData
    getOneCustomerContact(id: ID!): CustomerContact
    # Add Query
  }

  extend type Mutation {
    createCustomerContact(data: CreateCustomerContactInput!): CustomerContact
    deleteOneCustomerContact(id: ID!): CustomerContact
    # Add Mutation
  }

  input CreateCustomerContactInput {
    "Họ tên"
    name: String!
    "Tên doanh nghiệp"
    companyName: String!
    "Điên thoại"
    phone: String!
    "Email"
    email: String!
    "Địa chỉ"
    address: String
    "Nội dung"
    message: String
  }

  type CustomerContact {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Họ tên"
    name: String
    "Tên doanh nghiệp"
    companyName: String
    "Điên thoại"
    phone: String
    "Email"
    email: String
    "Địa chỉ"
    address: String
    "Nội dung"
    message: String
    "Trang thái ${Object.values(CustomerContactStatus)}"
    status: String
  }

  type CustomerContactPageData {
    data: [CustomerContact]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
