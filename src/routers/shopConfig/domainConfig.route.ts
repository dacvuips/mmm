import { Request, Response } from "express";
import fs from "fs";
import _, { Dictionary } from "lodash";
import $ from "mongo-dot-notation";
import multer from "multer";

import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { MemberModel } from "../../graphql/modules/member/member.model";
import { DomainConfigStatus } from "../../graphql/modules/shop/shopConfig/domain/domainConfig.graphql";
import {
  IShopConfig,
  ShopConfigModel,
} from "../../graphql/modules/shop/shopConfig/shopConfig.model";
import { validateJSON } from "../../helpers";
import { ValidHostnameRegex } from "../../helpers/functions/validate";
import nginx from "../../helpers/nginx";
import { logger } from "../../loaders/logger";
import LocalBroker from "../../services/broker";

export default [
  {
    method: "post",
    path: "/api/shopConfig/setupDomain",
    midd: [
      multer({
        dest: "tmp",
        limits: { fileSize: 500000 },
      }).fields([
        { name: "certificate", maxCount: 1 },
        { name: "certificateKey", maxCount: 1 },
        { name: "intermediateCertificate", maxCount: 1 },
      ]),
    ],
    action: async (req: Request, res: Response) => {
      const { certificate, certificateKey, intermediateCertificate } = req.files as Dictionary<
        Express.Multer.File[]
      >;
      let newCertId;
      let newProxyHostId;
      const context = new Context({ req });
      const member = await MemberModel.findById(context.sellerId);
      const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
        id: context.sellerId,
      });
      try {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        validateJSON(req.body, { required: ["hostName"] });
        const { hostName } = req.body;
        if (_.isEmpty(certificate)) throw Error("Chưa có file certificate");
        if (_.isEmpty(certificateKey)) throw Error("Chưa có file certificateKey");
        if (_.isEmpty(intermediateCertificate)) throw Error("Chưa có file intermediateCertificate");
        if (!ValidHostnameRegex.test(hostName)) throw Error("Định dạng tên miền không hợp lệ");

        const { code, shopName } = member;
        /**
         * Kiểm tra trạng thái tên miền đã đăng ký chưa
         */
        const domainStatus = shopConfig?.domainConfig?.status;
        if (domainStatus != DomainConfigStatus.disconnected) {
          throw Error("Cần huỷ đăng ký tên miền đang xử lý hoặc đã kết nối.");
        }
        await shopConfig.updateOne(
          $.flatten({
            domainConfig: { status: DomainConfigStatus.pending },
          })
        );
        // Xác thực file ssl
        await nginx.validateCertificates({
          certificate: certificate[0].path,
          certificate_key: certificateKey[0].path,
          intermediate_certificate: intermediateCertificate[0].path,
        });
        /**
         * Khởi tạo SSL Certificate
         */
        const cert = await nginx.createCustomCertificates({
          name: `${shopName} - ${hostName}`,
          certificate: certificate[0].path,
          certificate_key: certificateKey[0].path,
          intermediate_certificate: intermediateCertificate[0].path,
        });
        newCertId = cert.id;
        /**
         * Đăng ký proxy host
         */
        const proxyHost = await nginx.createProxyHosts({
          access_list_id: 0,
          advanced_config: `location = / { 
            proxy_pass http://$server:$port/${code}$request_uri; 
           }
           location ~ ^\\/(?!${code}|_next|graphql|api|assets|not-found-page)(\\w+)(.*) {
           rewrite ^\\/(\\w+)[\\/]?(.*) /$2 permanent;
           } `,
          domain_names: [hostName],
          forward_scheme: "http",
          forward_host: "3mshop_prod",
          forward_port: 5555,
          allow_websocket_upgrade: true,
          block_exploits: false,
          caching_enabled: false,
          certificate_id: cert.id,
          ssl_forced: true,
          http2_support: true,
          hsts_enabled: false,
          hsts_subdomains: false,
          meta: {
            letsencrypt_agree: false,
            dns_challenge: false,
          },
          locations: [],
        });
        newProxyHostId = proxyHost.id;
        /**
         * Xoá các đăng ký trước đó
         */
        const prevHostId = _.get(shopConfig, "domainConfig.proxyHostId");
        const prevCertificateId = _.get(shopConfig, "domainConfig.certificateId");
        if (prevHostId) {
          await nginx.deleteProxyHost(prevHostId).catch((err) => {});
        }
        if (prevCertificateId) {
          await nginx.deleteCertificate(prevCertificateId).catch((err) => {});
        }

        await shopConfig.updateOne(
          $.flatten({
            domainConfig: {
              status: DomainConfigStatus.connected,
              hostName: hostName,
              proxyHostId: proxyHost.id,
              certificateId: cert.id,
            },
          })
        );
        return res.json({ success: true });
      } catch (err) {
        /**
         * roll back trong trường hợp có lỗi xảy ra
         */
        if (newCertId != null) {
          await nginx.deleteCertificate(newCertId).catch((err) => {
            logger.error(`Lỗi khi rollback Certificate`, err);
          });
        }
        if (newProxyHostId != null) {
          await nginx.deleteProxyHost(newProxyHostId).catch((err) => {
            logger.error(`Lỗi khi rollback ProxyHost`, err);
          });
        }
        if (shopConfig?.domainConfig?.status != DomainConfigStatus.connected) {
          await ShopConfigModel.updateOne(
            { memberId: context.sellerId },
            $.flatten({
              domainConfig: { status: DomainConfigStatus.disconnected },
            })
          ).catch((err) => {
            logger.error(`Lỗi khi cập nhật trạng thái domain config`, err);
          });
        }
        throw err;
      } finally {
        if (certificate && certificate[0]) {
          fs.unlink(certificate[0].path, () => {});
        }
        if (certificateKey && certificateKey[0]) {
          fs.unlink(certificateKey[0].path, () => {});
        }
        if (intermediateCertificate && intermediateCertificate[0]) {
          fs.unlink(intermediateCertificate[0].path, () => {});
        }
      }
    },
  },
];
