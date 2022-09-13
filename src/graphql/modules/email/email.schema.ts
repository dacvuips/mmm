import { gql } from "apollo-server-express";
import { EmailType } from "./email.model";

const schema = gql`
  extend type Query {
    getAllEmail(q: QueryGetListInput): EmailPageData
    getOneEmail(id: ID!): Email
    # Add Query
  }

  extend type Mutation {
    createEmail(data: CreateEmailInput!): Email
    updateEmail(id: ID!, data: UpdateEmailInput!): Email
    deleteOneEmail(id: ID!): Email
    # Add Mutation
  }

  input CreateEmailInput {
    "Tên mẫu email"
    name: String!
    "Tiêu đề email"
    subject: String!
    "Nội dung text"
    text: String
    "Nội dung html"
    html: String!
    "Dữ liệu context"
    context: [Mixed]
    "Data Design"
    design: Mixed!
  }

  input UpdateEmailInput {
    "Tên mẫu email"
    name: String
    "Tiêu đề email"
    subject: String
    "Nội dung text"
    text: String
    "Nội dung html"
    html: String!
    "Dữ liệu context"
    context: [Mixed]
    "Data Design"
    design: Mixed
  }

  type Email {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Tên mẫu email"
    name: String
    "Loại email ${Object.values(EmailType)}"
    type: String
    "Tiêu đề email"
    subject: String
    "Nội dung text"
    text: String
    "Nội dung html"
    html: String
    "Dữ liệu context"
    context: [Mixed]
    "Data Design"
    design: Mixed
  }

  type EmailPageData {
    data: [Email]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
