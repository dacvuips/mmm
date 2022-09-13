import { gql } from "apollo-server-express";
import { Context } from "../../../../context";
import { approvalStatus } from "../../../../../constants/approveStatus";
import { ROLES } from "../../../../../constants/role.const";
import { notFoundHandler } from "../../../../../helpers/functions/notFoundHandler";
import { ShopSaleFeedModel } from "../shopSaleFeed.model";
import _ from "lodash";
import moment from "moment";
import { shopSaleFeedService } from "../shopSaleFeed.service";

export default {
  schema: gql`
      extend type Query {
          getAllPublicShopSaleFeed(q: QueryGetListInput): ShopSaleFeedPageData
      }
      extend type Mutation {
          approvalShopSaleFeed(id: ID!,data: approvalShopSaleFeed!): ShopSaleFeed
      }

      extend type ShopSaleFeed {
          "Trạng thái duyệt ${Object.values(approvalStatus)}"
          approvalStatus: String
          "Ngày duyệt"
          approvalDate: DateTime
          "Mã người duyệt"
          approvalBy: ID
      }
      input approvalShopSaleFeed {
          "Trạng thái duyệt ${Object.values(approvalStatus)}"
          approvalStatus: String!
      }
  `,
  resolver: {
    Query: {
      getAllPublicShopSaleFeed: async (root: any, args: any, context: Context) => {
        // set memberId to filter
        _.set(args, "q.filter.memberId", context.sellerId);
        _.set(args, "q.filter.active", true);
        _.set(args, "q.filter.approvalStatus", approvalStatus.APPROVED);
        _.set(args, "q.filter.showOnMarketPlace", true);

        return shopSaleFeedService.fetch(args.q);
      },
    },
    Mutation: {
      approvalShopSaleFeed: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ADMIN]);
        const { id, data } = args;

        const shopSaleFeed = await notFoundHandler(await ShopSaleFeedModel.findById(id));
        if (shopSaleFeed.approvalStatus !== approvalStatus.PENDING)
          throw new Error("Tin đã phê duyệt");
        _.set(data, "approvalDate", moment().toDate());
        _.set(data, "approvalBy", context.id);
        return await shopSaleFeedService.updateOne(id, data);
      },
    },
  },
};
