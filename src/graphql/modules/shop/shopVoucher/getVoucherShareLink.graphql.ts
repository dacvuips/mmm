import { gql } from "apollo-server-express";
import { configs } from "../../../../configs";
import { ROLES } from "../../../../constants/role.const";
import LocalBroker from "../../../../services/broker";
import { Context } from "../../../context";
import { MemberLoader, MemberModel } from "../../member/member.model";
import { DomainConfigStatus } from "../shopConfig/domain/domainConfig.graphql";
import { IShopConfig } from "../shopConfig/shopConfig.model";
import { IShopVoucher } from "./shopVoucher.model";

export default {
  schema: gql`
    extend type ShopVoucher {
      shareLink: String
    }
  `,
  resolver: {
    ShopVoucher: {
      shareLink: async (root: IShopVoucher, args: any, context: Context) => {
        let domain = configs.domain;
        const sellerId = root.memberId.toString();
        const member = await MemberLoader.load(sellerId);
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: sellerId,
        });
        const {
          domainConfig: { active, hostName, status },
        } = shopConfig;
        if (active && status === DomainConfigStatus.connected) {
          domain = `https://${hostName}`;
        }
        return `${domain}/${member.code}/promotion?promotionCode=${root.code}`;
      },
    },
  },
};
