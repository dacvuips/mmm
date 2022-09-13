import { gql } from "apollo-server-express";
import $ from "mongo-dot-notation";

import { ROLES } from "../../../../../constants/role.const";
import nginx from "../../../../../helpers/nginx";
import { logger } from "../../../../../loaders/logger";
import LocalBroker from "../../../../../services/broker";
import { Context } from "../../../../context";
import { IShopConfig } from "../shopConfig.model";
import { DomainConfigStatus } from "./domainConfig.graphql";

export default {
  schema: gql`
    extend type Mutation {
      cancelShopDomain: String
    }
  `,
  resolver: {
    Mutation: {
      cancelShopDomain: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);

        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: context.sellerId,
        });

        /**
         * Kiểm tra trạng thái tên miền đã đăng ký
         */
        const proxyHostId = shopConfig?.domainConfig?.proxyHostId;
        const certId = shopConfig?.domainConfig?.certificateId;
        console.log({ proxyHostId, certId });
        if (certId != null) {
          await nginx.deleteCertificate(certId).catch((err) => {
            logger.error(`Lỗi khi huỷ Certificate`, err);
          });
        }
        if (proxyHostId != null) {
          await nginx.deleteProxyHost(proxyHostId).catch((err) => {
            logger.error(`Lỗi khi huỷ ProxyHost`, err);
          });
        }
        await shopConfig.updateOne(
          $.flatten({
            domainConfig: {
              status: DomainConfigStatus.disconnected,
              hostName: $.$unset(),
              proxyHostId: $.$unset(),
              certificateId: $.$unset(),
            },
          })
        );

        return "OK";
      },
    },
  },
};
