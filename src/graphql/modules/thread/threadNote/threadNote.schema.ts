import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllThreadNote(q: QueryGetListInput): ThreadNotePageData
    getOneThreadNote(id: ID!): ThreadNote
    # Add Query
  }

  extend type Mutation {
    createThreadNote(data: CreateThreadNoteInput!): ThreadNote
    updateThreadNote(id: ID!, data: UpdateThreadNoteInput!): ThreadNote
    deleteOneThreadNote(id: ID!): ThreadNote
    # Add Mutation
  }

  input CreateThreadNoteInput {
    "Mã thread"
    threadId: ID!
    "Nội dung"
    text: String!
    "Đính kèm"
    attachment: String
  }

  input UpdateThreadNoteInput {
    "Nội dung"
    text: String
    "Đính kèm"
    attachment: String
  }

  type ThreadNote {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã thread"
    threadId: ID
    "Nội dung"
    text: String
    "Đính kèm"
    attachment: String
  }

  type ThreadNotePageData {
    data: [ThreadNote]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
