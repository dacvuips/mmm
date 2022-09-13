import _ from "lodash";
import { Logger } from "winston";

import cache from "../../../../../helpers/cache";
import zalo from "../../../../../helpers/zalo";
import { logger } from "../../../../../loaders/logger";
import { IShopConfig, ShopConfigModel } from "../shopConfig.model";

export async function clearZaloToken(memberId: string) {
  const key = `zalo:access_token:${memberId}`;
  await cache.del(key);
}

export async function setZaloToken(memberId: string, token: string) {
  const key = `zalo:access_token:${memberId}`;
  await cache.set(key, token, 60 * 59); // cache trong 59 phut
}

export async function getZaloToken(shopConfig: IShopConfig) {
  const refreshToken = _.get(shopConfig, "zaloConfig.meta.refreshToken");
  if (_.isEmpty(refreshToken) == true) {
    throw Error("Chưa liên kết Zalo OA");
  }

  const {
    zaloConfig: {
      oaInfo: { oa_id },
    },
  } = shopConfig;

  const key = `zalo:access_token:${shopConfig.memberId}`;
  const accessToken = await cache.get(key);
  if (_.isEmpty(accessToken) == false) {
    return accessToken;
  }

  const { access_token, refresh_token } = await zalo.getAccessTokenByRefreshToken(refreshToken);

  _.set(shopConfig, "zaloConfig.meta.refreshToken", refresh_token);
  await ShopConfigModel.updateOne(
    { _id: shopConfig._id },
    { $set: { "zaloConfig.meta.refreshToken": refresh_token } }
  ).exec();

  await setZaloToken(shopConfig.memberId, access_token);
  await clearShopConfigByOAId(oa_id);

  return access_token;
}

export async function getShopConfigByOAId(oaId: string) {
  const key = `zalo:shopConfig:${oaId}`;
  const result = JSON.parse(await cache.get(key));
  if (_.isEmpty(result) == false) {
    return ShopConfigModel.hydrate(result);
  }

  const shopConfig = await ShopConfigModel.findOne({ "zaloConfig.oaInfo.oa_id": oaId });
  if (_.isEmpty(shopConfig) == true) {
    throw Error("Chưa liên kết OA");
  }

  await cache.set(key, JSON.stringify(shopConfig), 60); // cache trong vòng 1 phút

  return shopConfig;
}

export async function clearShopConfigByOAId(oaId: string) {
  const key = `zalo:shopConfig:${oaId}`;
  await cache.del(key);
}

export type ZaloEventContext = {
  logger: Logger;
  event: any;
  shopConfig: IShopConfig;
};
