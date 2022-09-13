import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllAccount(q: QueryGetListInput): AccountPageData
    getOneAccount(id: ID!): Account
    # Add Query
  }

  extend type Mutation {
    createAccount(data: CreateAccountInput!): Account
    deleteOneAccount(id: ID!): Account
    # Add Mutation
  }

  input CreateAccountInput {
    "Mã tài khoản"
    code: String
    "Phương thức đăng nhập"
    loginMethod: String
    "Key truy cập"
    accessKey: String
    "Key bí mật"
    secretKey: String
  }

  type Account {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã tài khoản"
    code: String
    "Phương thức đăng nhập"
    loginMethod: String
    "Key truy cập"
    accessKey: String
    "Đăng nhập lần cuối"
    lastSignedInAt: DateTime
    "Email"
    email: String
    "Đã xác thực email"
    emailVerified: Boolean
  }

  type AccountPageData {
    data: [Account]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
