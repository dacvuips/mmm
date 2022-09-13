import { gql } from "apollo-server-express";
import $ from "mongo-dot-notation";
import { Schema } from "mongoose";

import { ROLES } from "../../../../../constants/role.const";
import { GraphQLHelper } from "../../../../../helpers/graphql.helper";
import manychat from "../../../../../helpers/manychat";
import { logger } from "../../../../../loaders/logger";
import { Context } from "../../../../context";
import { ShopConfigModel } from "../shopConfig.model";

export type ManychatConfig = {
  active?: boolean; // Bật / tắt manychat
  status?: string; // Trạng thái kết nối
  apiKey?: string; // API Key
  pageInfo?: any; // Thông tin trang
  mappingField?: string; // Thường thông tin liên kết
};

export const ManychatConfigSchema = new Schema({
  active: { type: Boolean, default: false },
  status: { type: String, default: "disconnected" },
  apiKey: { type: String },
  pageInfo: { type: Schema.Types.Mixed },
  mappingField: { type: String },
});

export default {
  schema: gql`
    type ManychatConfig {
      "Bật / tắt manychat"
      active: Boolean
      "Trạng thái kết nối disconnected | connected"
      status: String
      "Thông tin trang"
      pageInfo: Mixed
      "Thường thông tin liên kết"
      mappingField: String
    }
    input ManychatConfigInput {
      "Bật / tắt manychat"
      active: Boolean
      "Thường thông tin liên kết"
      mappingField: String
    }

    extend type ShopConfig {
      manychatConfig: ManychatConfig
    }

    extend input UpdateShopConfigInput {
      manychatConfig: ManychatConfigInput
    }

    extend type Mutation {
      connectManychat(apiKey: String!): ShopConfig
      disconnectManychat: ShopConfig
    }
  `,
  resolver: {
    ShopConfig: {
      manychatConfig: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], null),
    },
    Mutation: {
      connectManychat: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        const { apiKey } = args;

        const pageInfo = await manychat.getPageInfo(apiKey);

        logger.info(`Kết nối Manychat`, { pageInfo });

        return await ShopConfigModel.findOneAndUpdate(
          { memberId: context.sellerId },
          $.flatten({
            manychatConfig: {
              status: "connected",
              apiKey: apiKey,
              pageInfo: $.$set(pageInfo),
            },
          }),
          { new: true }
        );
      },
      disconnectManychat: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        return await ShopConfigModel.findOneAndUpdate(
          { memberId: context.sellerId },
          $.flatten({
            manychatConfig: { status: "disconnected", apiKey: $.$unset(), pageInfo: $.$unset() },
          }),
          { new: true }
        );
      },
    },
  },
};
