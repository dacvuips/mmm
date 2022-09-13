import { gql } from "apollo-server-express";
import { PostStatus } from "../../post/post.model";

const schema = gql`
  extend type Query {
    getAllShopPost(q: QueryGetListInput): ShopPostPageData
    getOneShopPost(id: ID!): ShopPost
    # Add Query
  }

  extend type Mutation {
    createShopPost(data: CreateShopPostInput!): ShopPost
    updateShopPost(id: ID!, data: UpdateShopPostInput!): ShopPost
    deleteOneShopPost(id: ID!): ShopPost
    # Add Mutation
  }

  input CreateShopPostInput {
    "Tiêu đề"
    title: String!
    "Đoạn trích"
    excerpt: String
    "từ khoá"
    slug: String
    "Trạng thái ${Object.values(PostStatus)}"
    status: String
    "Ngày công khai"
    publishedAt: DateTime
    "Hình đại diện"
    featureImage: String
    "Mô tả meta tag"
    metaDescription: String
    "Tiêu đề meta tag"
    metaTitle: String
    "Nội dung html"
    content: String
    "Danh sách tag"
    tagIds: [ID]
    "Mô tả open graph"
    ogDescription: String
    "Hình ảnh open graph"
    ogImage: String
    "Tiêu đề open graph"
    ogTitle: String
    "Mô tả twitter"
    twitterDescription: String
    "Hình ảnh twitter"
    twitterImage: String
    "Tiêu đề twitter"
    twitterTitle: String
    "Độ ưu tiên"
    priority: Int
    "Danh sách chủ đề"
    topicIds: [String]
    # "Danh sách file đính kèm"
    # attachmentIds: [ID]
  }

  input UpdateShopPostInput {
    "Tiêu đề"
    title: String
    "Đoạn trích"
    excerpt: String
    "từ khoá"
    slug: String
    "Trạng thái ${Object.values(PostStatus)}"
    status: String
    "Ngày công khai"
    publishedAt: DateTime
    "Hình đại diện"
    featureImage: String
    "Mô tả meta tag"
    metaDescription: String
    "Tiêu đề meta tag"
    metaTitle: String
    "Nội dung html"
    content: String
    "Danh sách tag"
    tagIds: [ID]
    "Mô tả open graph"
    ogDescription: String
    "Hình ảnh open graph"
    ogImage: String
    "Tiêu đề open graph"
    ogTitle: String
    "Mô tả twitter"
    twitterDescription: String
    "Hình ảnh twitter"
    twitterImage: String
    "Tiêu đề twitter"
    twitterTitle: String
    "Độ ưu tiên"
    priority: Int
    "Danh sách chủ đề"
    topicIds: [String]
    # "Danh sách file đính kèm"
    # attachmentIds: [ID]
  }

  type ShopPost {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã thành viên"
    memberId: ID
    "Tiêu đề"
    title: String
    "Đoạn trích"
    excerpt: String
    "từ khoá"
    slug: String
    "Trạng thái ${Object.values(PostStatus)}"
    status: String
    "Ngày công khai"
    publishedAt: DateTime
    "Hình đại diện"
    featureImage: String
    "Mô tả meta tag"
    metaDescription: String
    "Tiêu đề meta tag"
    metaTitle: String
    "Nội dung html"
    content: String
    "Danh sách tag"
    tagIds: [ID]
    "Mô tả open graph"
    ogDescription: String
    "Hình ảnh open graph"
    ogImage: String
    "Tiêu đề open graph"
    ogTitle: String
    "Mô tả twitter"
    twitterDescription: String
    "Hình ảnh twitter"
    twitterImage: String
    "Tiêu đề twitter"
    twitterTitle: String
    "Độ ưu tiên"
    priority: Int
    "Số lượt view"
    view: Int
    "Danh sách chủ đề"
    topicIds: [ID]
    # "Danh sách file đính kèm"
    # attachmentIds: [ID]

    tags: [ShopPostTag]
    topics: [ShopTopic]
    # attachments: [Attachment]
  }

  type ShopPostPageData {
    data: [ShopPost]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
