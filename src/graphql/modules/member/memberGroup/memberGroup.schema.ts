import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllMemberGroup(q: QueryGetListInput): MemberGroupPageData
    getOneMemberGroup(id: ID!): MemberGroup
    # Add Query
  }

  extend type Mutation {
    createMemberGroup(data: CreateMemberGroupInput!): MemberGroup
    updateMemberGroup(id: ID!, data: UpdateMemberGroupInput!): MemberGroup
    deleteOneMemberGroup(id: ID!): MemberGroup
    # Add Mutation
  }

  input CreateMemberGroupInput {
    "Tên nhóm member"
    name: String
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  input UpdateMemberGroupInput {
    "Tên nhóm member"
    name: String
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  type MemberGroup {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Tên nhóm member"
    name: String
    "Ưu tiên"
    priority: Int
    "Kích hoạt"
    active: Boolean
  }

  type MemberGroupPageData {
    data: [MemberGroup]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
