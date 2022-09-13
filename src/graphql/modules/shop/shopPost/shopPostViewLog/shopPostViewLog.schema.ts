import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllShopPostViewLog(q: QueryGetListInput): ShopPostViewLogPageData
    getOneShopPostViewLog(id: ID!): ShopPostViewLog
    # Add Query
  }

  type ShopPostViewLog {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã thành viên"
    memberId: ID
    "Mã post"
    postId: ID
    "Mã người dùng"
    userId: ID
    "Lượt view"
    view: Int
  }

  type ShopPostViewLogPageData {
    data: [ShopPostViewLog]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
