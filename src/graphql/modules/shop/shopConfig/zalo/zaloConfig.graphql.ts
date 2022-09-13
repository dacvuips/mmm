import { gql } from "apollo-server-express";
import _ from "lodash";
import $ from "mongo-dot-notation";
import { Schema } from "mongoose";
import pkceChallenge from "pkce-challenge";

import { BaseError } from "../../../../../base/error";
import { ROLES } from "../../../../../constants/role.const";
import cache from "../../../../../helpers/cache";
import { GraphQLHelper } from "../../../../../helpers/graphql.helper";
import zalo from "../../../../../helpers/zalo";
import zaloOa from "../../../../../helpers/zalo/zaloOa";
import { logger } from "../../../../../loaders/logger";
import { Context } from "../../../../context";
import { ShopConfigModel } from "../shopConfig.model";
import { clearShopConfigByOAId, setZaloToken } from "./common";

export enum ZaloConfigStatus {
  connected = "connected", // Đã kết nối
  disconnect = "disconnect", // Chưa kết nối
}

export type ZaloConfig = {
  active?: boolean; // Kích hoạt
  status?: ZaloConfigStatus; // Trạng thái kết nối
  meta?: any; // Đữ liệu
  oaInfo?: any; // Thông tin OA
  eventFollowOA?: any; // Sự kiện follow OA
};

export const ZaloConfigSchema = new Schema({
  active: { type: Boolean, default: false },
  status: { type: String, default: "disconnect" },
  meta: { type: Schema.Types.Mixed, default: {} },
  oaInfo: { type: Schema.Types.Mixed, default: {} },
  eventFollowOA: { type: Schema.Types.Mixed, default: { active: false } },
});

export default {
  schema: gql`
    type ZaloConfig {
      "Kích hoạt"
      active: Boolean
      "Trạng thái kết nối ${Object.values(ZaloConfigStatus)}"
      status: String
      "Thông tin OA"
      oaInfo: Mixed
      "Sự kiện follow OA"
      eventFollowOA: Mixed
    }
    input ZaloConfigInput {
      "Kích hoạt"
      active: Boolean
      "Sự kiện follow OA"
      eventFollowOA: Mixed
    }
    extend type ShopConfig {
      zaloConfig: ZaloConfig
    }

    extend input UpdateShopConfigInput {
      zaloConfig: ZaloConfigInput
    }

    extend type Mutation {
      generateZaloAuthLink(redirectUrl: String!): String
      connectZalo(code: String!): ShopConfig
      disconnectZalo: ShopConfig
    }
  `,
  resolver: {
    ShopConfig: {
      zaloConfig: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], null),
    },
    Mutation: {
      generateZaloAuthLink: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        const { redirectUrl } = args;

        const pair = await generatePKCEPair(context.sellerId);

        return await zalo.getAuthUrl(redirectUrl, pair.code_challenge, context.sellerId);
      },
      connectZalo: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { code } = args;
        const pair = await getPKCEPair(context.sellerId);

        if (_.isEmpty(pair) == true) {
          throw new BaseError(500, "connect-zalo-error", `Mã kết nối hết hạn`);
        }

        const { access_token, refresh_token } = await zalo.getAccessTokenByAuthCode(
          code,
          pair.code_verifier
        );

        // Láy thông tin OA
        const oaInfo = await zaloOa.getInfo(access_token);

        // Lưu thông tin vào cấu hình
        const shopConfig = await ShopConfigModel.findOneAndUpdate(
          { memberId: context.sellerId },
          $.flatten({
            zaloConfig: {
              status: ZaloConfigStatus.connected,
              meta: $.$set({
                refreshToken: refresh_token,
              }),
              oaInfo: $.$set(oaInfo),
            },
          }),
          { new: true }
        ).exec();
        logger.info(`Kết nối Zalo Thành công`, { oaInfo });

        await clearPKCEPair(context.sellerId);
        await setZaloToken(context.sellerId, access_token);
        await clearShopConfigByOAId(oaInfo.oa_id);

        return shopConfig;
      },
      disconnectZalo: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        return await ShopConfigModel.findOneAndUpdate(
          { memberId: context.sellerId },
          $.flatten({
            zaloConfig: {
              status: ZaloConfigStatus.disconnect,
              meta: $.$set({}),
              oaInfo: $.$set({}),
            },
          }),
          { new: true }
        );
      },
    },
  },
};

async function generatePKCEPair(key: string) {
  const pair = pkceChallenge();
  await cache.set(`pkce-challenge:${key}`, JSON.stringify(pair), 60 * 60); // cache trong 5 phút
  return pair;
}
async function getPKCEPair(key: string) {
  return JSON.parse(await cache.get(`pkce-challenge:${key}`));
}
async function clearPKCEPair(key: string) {
  await cache.del(`pkce-challenge:${key}`);
}
