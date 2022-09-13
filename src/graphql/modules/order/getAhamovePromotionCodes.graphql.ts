import { gql } from "apollo-server-express";
import jwt from "jsonwebtoken";
import _ from "lodash";

import { ROLES } from "../../../constants/role.const";
import { Ahamove } from "../../../helpers/ahamove/ahamove";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { shopConfigService } from "../shop/shopConfig/shopConfig.service";
import { OrderLoader } from "./order.model";

export default {
  schema: gql`
    extend type Query {
      getAhamovePromotions(orderId: ID!): [AhamovePromotion]
    }

    type AhamovePromotion {
      id: String
      desc: String
      content: String
      image: String
      isHtmlContent: Boolean
      valid: Boolean
      discount: Float
      minItemFee: Float
      remainingUse: Float
    }
  `,
  resolver: {
    Query: {
      getAhamovePromotions: async (root: any, args: any, context: Context) => {
        // context.auth(ROLES.MEMBER_STAFF);
        const { orderId } = args;

        const order = await OrderLoader.load(orderId);
        const ahamove = new Ahamove({});
        let shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: order.fromMemberId.toString(),
        });

        const lat: number = parseFloat(order.latitude);
        const lng: number = parseFloat(order.longitude);

        if (_.isEmpty(shopConfig.shipAhamoveToken)) {
          await resetAhamoveToken();
        }
        // decode shipAhamoveToken and check if expired then reset token
        const decoded = jwt.decode(shopConfig.shipAhamoveToken) as any;
        if (decoded.exp < Date.now() / 1000) {
          await resetAhamoveToken();
        }

        const token = shopConfig.shipAhamoveToken;

        return (await ahamove.getPromotionCodes({ token, lat, lng })).map((p: any) => ({
          id: p._id,
          desc: p.description_vi_vn,
          content: p.content_vi_vn,
          image: p.image_url,
          isHtmlContent: p.is_html_content,
          valid: p.valid,
          discount: p.estimate_discount,
          minItemFee: p.min_item_fee,
          remainingUse: p.remaining_use,
        }));

        async function resetAhamoveToken() {
          const member = await MemberLoader.load(shopConfig.memberId);
          await shopConfigService.setAhamoveToken(member);
          shopConfig = await ShopConfigModel.findById(shopConfig._id);
        }
      },
    },
  },
};
