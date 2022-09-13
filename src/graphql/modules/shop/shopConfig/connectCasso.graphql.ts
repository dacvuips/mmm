import { gql } from "apollo-server-express";
import _ from "lodash";
import { SettingKey } from "../../../../configs/settingData";
import { ROLES } from "../../../../constants/role.const";
import casso from "../../../../helpers/casso";
import LocalBroker from "../../../../services/broker";
import { Context } from "../../../context";
import { MemberLoader } from "../../member/member.model";
import { SettingHelper } from "../../setting/setting.helper";
import { IShopConfig, ShopConfigModel } from "./shopConfig.model";

export default {
  schema: gql`
    extend type Mutation {
      connectCasso(apiKey: String!): ShopConfig
      disconnectCasso: ShopConfig
    }
  `,
  resolver: {
    Mutation: {
      connectCasso: async (root: any, args: any, context: Context) => {
        // Chỉ dành chi chủ shop
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { apiKey } = args;

        // Kiểm tra thông tin apiKey
        const token = await casso.getToken(apiKey);
        const userInfo = await casso.getUser(token);

        // Khai báo webhook nhận tin
        const [appDomain] = await SettingHelper.loadMany([SettingKey.APP_DOMAIN]);
        const member = await MemberLoader.load(context.sellerId);

        // const webhookUrl = `https://webhook.site/a1d97727-c7bc-4954-8398-9f1d5b1ef8d5`;
        const webhookUrl = `${appDomain}/api/paymentTracking/casso/${context.sellerId}`;
        const secretToken = member.code;

        const webhook = await casso.regisWebhookByApiKey(apiKey, webhookUrl, secretToken);

        // Lưu webhook lại
        return await ShopConfigModel.findOneAndUpdate(
          { memberId: member._id },
          {
            $set: {
              cassoApiKey: apiKey,
              cassoWebhookId: webhook.id,
              cassoUser: userInfo,
              cassoStatus: "connected",
            },
          },
          { new: true }
        );
      },
      disconnectCasso: async (root: any, args: any, context: Context) => {
        // Chỉ dành cho chủ shop
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: context.sellerId,
        });
        if (_.isEmpty(shopConfig.cassoApiKey) == false) {
          // Nếu chủ shop đã có apiKey từ trước
          const { cassoApiKey: apiKey, cassoWebhookId: webhookId } = shopConfig;
          if (_.isEmpty(webhookId) == false) {
            // Nếu có đăng ký webhook rồi, thì xoá webhook đi
            const token = await casso.getToken(apiKey);
            await casso.deleteWebhook(token, webhookId);
          }
        }

        // Cập nhật lại shopConfig
        return await ShopConfigModel.findOneAndUpdate(
          { _id: shopConfig._id },
          {
            $set: {
              cassoApiKey: null,
              cassoUser: null,
              cassoWebhookId: null,
              cassoStatus: "disconnect",
            },
          },
          { new: true }
        );
      },
    },
  },
};
