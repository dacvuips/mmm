import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllThreadLabel(q: QueryGetListInput): ThreadLabelPageData
    getOneThreadLabel(id: ID!): ThreadLabel
    # Add Query
  }

  extend type Mutation {
    createThreadLabel(data: CreateThreadLabelInput!): ThreadLabel
    updateThreadLabel(id: ID!, data: UpdateThreadLabelInput!): ThreadLabel
    deleteOneThreadLabel(id: ID!): ThreadLabel
    # Add Mutation
  }

  input CreateThreadLabelInput {
    "Tên nhãn"
    name: String
    "Màu sắc"
    color: String
  }

  input UpdateThreadLabelInput {
    "Tên nhãn"
    name: String
    "Màu sắc"
    color: String
  }

  type ThreadLabel {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Tên nhãn"
    name: String
    "Mã chủ shop"
    memberId: ID
    "Màu sắc"
    color: String
  }

  type ThreadLabelPageData {
    data: [ThreadLabel]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
