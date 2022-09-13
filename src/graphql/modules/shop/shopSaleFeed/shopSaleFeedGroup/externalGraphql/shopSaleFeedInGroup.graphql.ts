import { gql } from "apollo-server-express";
import { GraphQLHelper } from "../../../../../../helpers/graphql.helper";
import { ShopSaleFeedGroupLoader } from "../shopSaleFeedGroup.model";

export default {
  schema: gql`
    extend type ShopSaleFeed {
      "Mã nhóm tin đăng bán"
      shopSaleFeedGroupId: String
      "Nhóm tin đăng bán"
      shopSaleFeedGroup: ShopSaleFeedGroup
    }
  `,
  resolver: {
    ShopSaleFeed: {
      shopSaleFeedGroup: GraphQLHelper.loadById(ShopSaleFeedGroupLoader, "shopSaleFeedGroupId"),
    },
  },
};
