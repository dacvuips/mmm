import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { ROLES } from "../../../../../constants/role.const";
import { GraphQLHelper } from "../../../../../helpers/graphql.helper";

export type NotifyConfig = {
  orderPending?: string; // đơn hàng chờ
  orderCanceled?: string; // huỷ đơn
  orderConfirmed?: string; // đang làm món
  orderCompleted?: string; // đơn hoàn thành
  orderFailure?: string; // đơn giao thất bại
  orderRewardPoint?: string; // tặng điểm thưởng

  //TODO: thêm cấu hình tin nhắn cho nhân viên
  orderPendingForStaff?: string; // đơn hàng chờ cho nhân viên
  orderCanceledForStaff?: string; // huỷ đơn cho nhân viên
  orderConfirmedForStaff?: string; // đang làm món cho nhân viên
  orderCompletedForStaff?: string; // đơn hoàn thành cho nhân viên
  orderFailureForStaff?: string; // đơn giao thất bại cho nhân viên

  colRegisSuccess?: string; // CTV đăng ký thành công
  ahamoveNotifyEnabled?: boolean; // Bật thông báo ahamove
};

export const NotifyConfigSchema = new Schema({
  orderPending: { type: String },
  orderCanceled: { type: String },
  orderConfirmed: { type: String },
  orderCompleted: { type: String },
  orderFailure: { type: String },

  //TODO: khai báo schema
  orderPendingForStaff: { type: String }, // đơn hàng chờ cho nhân viên
  orderCanceledForStaff: { type: String }, // huỷ đơn cho nhân viên
  orderConfirmedForStaff: { type: String }, // đang làm món cho nhân viên
  orderCompletedForStaff: { type: String }, // đơn hoàn thành cho nhân viên
  orderFailureForStaff: { type: String },

  orderRewardPoint: { type: String },
  colRegisSuccess: { type: String },
  ahamoveNotifyEnabled: { type: Boolean, default: false },
});

export default {
  schema: gql`
    type NotifyConfig {
      "đơn hàng chờ"
      orderPending: String
      "huỷ đơn"
      orderCanceled: String
      "đang làm món"
      orderConfirmed: String
      "đơn hoàn thành"
      orderCompleted: String
      "đơn giao thất bại"
      orderFailure: String

      "đơn hàng chờ cho nhân viên"
      orderPendingForStaff: String
      "huỷ đơn cho nhân viên"
      orderCanceledForStaff: String
      "đang làm món cho nhân viên"
      orderConfirmedForStaff: String
      "đơn hoàn thành cho nhân viên"
      orderCompletedForStaff: String
      "đơn giao thất bại cho nhân viên"
      orderFailureForStaff: String

      "tặng điểm thưởng"
      orderRewardPoint: String
      "CTV đăng ký thành công"
      colRegisSuccess: String
      "Bật thông báo ahamove"
      ahamoveNotifyEnabled: Boolean
    }
    input NotifyConfigInput {
      "đơn hàng chờ"
      orderPending: String
      "huỷ đơn"
      orderCanceled: String
      "đang làm món"
      orderConfirmed: String
      "đơn hoàn thành"
      orderCompleted: String
      "đơn giao thất bại"
      orderFailure: String
      "đơn hàng chờ cho nhân viên"
      orderPendingForStaff: String
      "huỷ đơn cho nhân viên"
      orderCanceledForStaff: String
      "đang làm món cho nhân viên"
      orderConfirmedForStaff: String
      "đơn hoàn thành cho nhân viên"
      orderCompletedForStaff: String
      "đơn giao thất bại cho nhân viên"
      orderFailureForStaff: String

      "tặng điểm thưởng"
      orderRewardPoint: String
      "CTV đăng ký thành công"
      colRegisSuccess: String
      "Bật thông báo ahamove"
      ahamoveNotifyEnabled: Boolean
    }

    extend type ShopConfig {
      notifyConfig: NotifyConfig
    }
    extend input UpdateShopConfigInput {
      notifyConfig: NotifyConfigInput
    }
  `,
  resolver: {
    ShopConfig: {
      notifyConfig: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], null),
    },
  },
};
