import { gql } from "apollo-server-express";
import _ from "lodash";

import { configs } from "../../../configs";
import { SettingKey } from "../../../configs/settingData";
import { ROLES } from "../../../constants/role.const";
import { UtilsHelper } from "../../../helpers";
import esms from "../../../helpers/esms";
import { logger } from "../../../loaders/logger";
import { Context } from "../../context";
import { counterService } from "../counter/counter.service";
import { CustomerLoader, ICustomer } from "../customer/customer.model";
import { IMember, MemberLoader } from "../member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../notification/notification.model";
import { OrderModel, OrderStatus } from "../order/order.model";
import { SettingHelper } from "../setting/setting.helper";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { triggerService } from "../trigger/trigger.service";
import { CollaboratorModel, CollaboratorStatus } from "./collaborator.model";
import { collaboratorService } from "./collaborator.service";

export default {
  schema: gql`
    extend type Mutation {
      regisCollaborator: Collaborator
    }
  `,
  resolver: {
    Mutation: {
      regisCollaborator: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const [customer, shopConfig, col, member] = await Promise.all([
          CustomerLoader.load(context.id),
          ShopConfigModel.findOne({ memberId: context.sellerId }),
          CollaboratorModel.findOne({ customerId: context.id }),
          MemberLoader.load(context.sellerId),
        ]);
        if (col) return col;
        const colByPhone = await CollaboratorModel.findOne({
          memberId: context.sellerId,
          phone: customer.phone,
        });
        if (colByPhone && colByPhone.customerId && colByPhone.customerId.toString() != context.id)
          throw Error("Số điện thoại này đã được đăng ký.");
        if (colByPhone && !colByPhone.customerId) {
          colByPhone.customerId = customer._id;
          await customer.updateOne({ $set: { collaboratorId: colByPhone._id } });
        }

        if (shopConfig.colMinOrder > 0) {
          const orderCount = await OrderModel.count({
            sellerId: context.sellerId,
            buyerId: context.id,
            status: OrderStatus.COMPLETED,
          });
          if (orderCount < shopConfig.colMinOrder)
            throw Error(`Yêu cầu phải có ${shopConfig.colMinOrder} đơn hoàn thành`);
        }
        const data: any = {
          code: await counterService.trigger("collaborator").then((res) => "CTV" + res),
          memberId: context.sellerId,
          customerId: context.id,
          name: customer.name,
          phone: customer.phone,
        };
        const { shortCode, shortUrl, status } = await collaboratorService.generateShortCode(
          context.sellerId,
          data
        );
        data.shortCode = shortCode;
        data.shortUrl = shortUrl;
        data.status = status;
        const newCol = await CollaboratorModel.create(data);
        await customer.updateOne({ $set: { collaboratorId: newCol._id } });

        await sendNotifyToCustomer(shopConfig, customer, member);
        await sendSMSToCustomer(shopConfig, customer, member);
        if (newCol.status === CollaboratorStatus.ACTIVE) {
          triggerService.emitEvent("collaborator:registered", newCol.memberId, {
            ...newCol,
            sellerId: newCol.memberId,
            buyerId: newCol.customerId,
          });
        }
        return newCol;
      },
    },
  },
};

async function sendSMSToCustomer(shopConfig: IShopConfig, customer: ICustomer, member: IMember) {
  try {
    if (!shopConfig.smsCol) return;
    const smsTemplate = await SettingHelper.load(SettingKey.SMS_COL_REGIS_SUCCESS);
    const context = {
      SHOP_NAME: member.shopName,
      SHOP_CODE: member.code,
      CUSTOMER_NAME: customer.name,
      DOMAIN: configs.domain,
    };
    const parsedMsg = UtilsHelper.parseStringWithInfo({ data: smsTemplate, info: context });

    await esms.send(customer.phone, parsedMsg);
  } catch (err) {
    logger.error(`Lỗi khi gửi thông báo SMS CTV thành công`, err);
  }
}

async function sendNotifyToCustomer(shopConfig: IShopConfig, customer: ICustomer, member: IMember) {
  try {
    const defaultMsg = `Chúc mừng bạn đăng ký thành công cộng tác viên. Hãy bắt đầu chia sẻ và nhận được nhiều hoa hồng của bạn.`;
    const colRegisSuccessMsg = _.get(shopConfig, "notifyConfig.colRegisSuccess", defaultMsg);
    const message = UtilsHelper.parseStringWithInfo({
      data: colRegisSuccessMsg,
      info: { customer },
    });
    // Gửi thông báo đăng ký thành công
    const notify = new NotificationModel({
      target: NotificationTarget.CUSTOMER,
      type: NotificationType.WEBSITE,
      customerId: customer._id,
      title: `Đăng ký CTV thành công`,
      body: message,
      link: `${configs.domain}/${member.code}/collaborator/info`,
    });
    await InsertNotification([notify]);
  } catch (err) {
    logger.error(`Lỗi khi gửi thông báo CTV thành công`, err);
  }
}
