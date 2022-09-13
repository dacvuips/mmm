import { gql } from "apollo-server-express";
import { Schema } from "mongoose";

import { ROLES } from "../../../../../constants/role.const";
import { GraphQLHelper } from "../../../../../helpers/graphql.helper";

export enum DomainConfigStatus {
  pending = "pending", // Đang xử lý
  connected = "connected", // Đã kết nối
  disconnected = "disconnected", // Chưa kết nối
}
export type DomainConfig = {
  active?: boolean; // Bật / tắt tính năng
  hostName?: string; // Tên miền
  status?: DomainConfigStatus; // Trạng thái kết nối
  proxyHostId?: number; // Mã host
  certificateId?: number; // Mã Cert SSL
};
export const DomainConfigSchema = new Schema({
  active: { type: Boolean, default: false },
  hostName: { type: String },
  status: {
    type: String,
    enum: Object.values(DomainConfigStatus),
    default: DomainConfigStatus.disconnected,
  },
  proxyHostId: { type: Number },
  certificateId: { type: Number },
});
export default {
  schema: gql`
    type DomainConfig {
      "Bật / tắt tính năng"
      active: Boolean
      "Tên miền"
      hostName: String
      "Trạng thái kết nối ${Object.values(DomainConfigStatus)}"
      status: String
    }
    input DomainConfigInput {
      "Bật / tắt tính năng"
      active: Boolean
    }
    extend type ShopConfig {
      "Cấu hình tên miền"
      domainConfig: DomainConfig
    }
    extend input UpdateShopConfigInput {
      "Cấu hình tên miền"
      domainConfig: DomainConfigInput
    }
  `,
  resolver: {
    ShopConfig: {
      domainConfig: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], null),
    },
  },
};
