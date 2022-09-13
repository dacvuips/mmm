import { gql } from "apollo-server-express";
import { Context } from "../../../../../context";
import { ROLES } from "../../../../../../constants/role.const";
import { shopSaleFeedService } from "../../shopSaleFeed.service";

export default {
  schema: gql`
    extend type Mutation {
      updateShopSaleFeedAdmin(id: ID!, data: UpdateShopSaleFeedAdminInput!): ShopSaleFeed
    }
    input UpdateShopSaleFeedAdminInput {
      "Mã nhóm tin đăng bán"
      shopSaleFeedGroupId: ID!
    }
  `,
  resolver: {
    Mutation: {
      updateShopSaleFeedAdmin: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ADMIN]);
        const { id, data } = args;
        return await shopSaleFeedService.updateOne(id, data);
      },
    },
  },
};
