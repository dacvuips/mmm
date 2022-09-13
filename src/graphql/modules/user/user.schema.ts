import { gql } from "apollo-server-express";
import { UserRole, UserScope } from "./user.model";

const schema = gql`
extend type Query {
  getAllUser(q: QueryGetListInput): UserPageData
  getOneUser(id: ID!): User
  userGetMe: User
}

extend type Mutation {
  createUser(data: CreateUserInput!): User
  updateUser(id: ID!, data: UpdateUserInput!): User
  deleteOneUser(id: ID!): User
  
  userUpdateMe(data: UserUpdateMeInput!): User
  setUserPSID(userId: ID!, psid: String!): User
  # Add Mutation
}

input CreateUserInput {
  email: String!
  password: String!
  name: String
  phone: String
  address: String
  avatar: String
  provinceId: String
  districtId: String
  wardId: String
  """${Object.values(UserRole).join("|")}"""
  role: String
  "Danh sách phân quyền ${Object.values(UserScope)}"
  scopes: [String] 
}

input UpdateUserInput {
  name: String
  phone: String
  address: String
  avatar: String
  provinceId: String
  districtId: String
  wardId: String
  """${Object.values(UserRole).join("|")}"""
  role: String
  "Danh sách phân quyền ${Object.values(UserScope)}"
  scopes: [String] 
}

input UserUpdateMeInput {
  name: String
  phone: String
  address: String
  avatar: String
  provinceId: String
  districtId: String
  wardId: String
  """${Object.values(UserRole).join("|")}"""
  role: String
}

type User {
  id: String
  uid: String
  email: String
  name: String
  phone: String
  address: String
  avatar: String
  province: String
  district: String
  ward: String
  provinceId: String
  districtId: String
  wardId: String
  """${Object.values(UserRole).join("|")}"""
  role: String
  unseenNotify: Int
  createdAt: DateTime
  updatedAt: DateTime
  "Mã PSID fanpage chính"
  psid: String

  "Danh sách phân quyền ${Object.values(UserScope)}"
  scopes: [String] 
  subscriber: SubscriberInfo
}



type UserPageData {
  data: [User]
  total: Int
  pagination: Pagination
}
`;

export default schema;
