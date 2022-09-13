import { gql } from "apollo-server-express";
import _ from "lodash";
import moment from "moment-timezone";

import { ROLES } from "../../../constants/role.const";
import cache from "../../../helpers/cache";
import manychat from "../../../helpers/manychat";
import { TokenHelper } from "../../../helpers/token.helper";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { Context } from "../../context";
import { DeviceInfoModel } from "../deviceInfo/deviceInfo.model";
import { IShopConfig } from "../shop/shopConfig/shopConfig.model";
import { CustomerModel, ICustomer } from "./customer.model";

export default {
  schema: gql`
    extend type Mutation {
      loginCustomerByPhone(
        phone: String!
        name: String
        otp: String
        deviceId: String
        deviceToken: String
      ): CustomerLoginData
    }
    type CustomerLoginData {
      customer: Customer
      token: String
    }
  `,
  resolver: {
    Mutation: {
      loginCustomerByPhone: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ANONYMOUS]);
        const { phone, otp, deviceId, deviceToken, name } = args;

        // Tìm kiếm người dùng bằng điện thoại
        const customer = await CustomerModel.findOneAndUpdate(
          { phone, memberId: context.sellerId },
          { $setOnInsert: { name: name || "" } },
          { upsert: true, new: true }
        );
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: context.sellerId,
        });

        if (shopConfig.smsOtp) {
          // Yêu cầu đăng nhập băng OTP
          if (!otp || customer.otp != otp) throw Error("Mã pin đăng nhập không đúng.");
          if (moment().isAfter(moment(customer.otpExpired).add(5, "minute")))
            throw Error("Mã pin đã hết hạn");
          await customer
            .update({
              $unset: { otp: 1, otpExpired: 1, otpRetryExpired: 1 },
              $set: { otpRetry: 0 },
            })
            .exec();
        }

        if (deviceId && deviceToken) {
          // Cập nhật thông tin device để nhân thông báo
          await DeviceInfoModel.remove({
            $or: [{ deviceToken }, { deviceId }],
          });
          await DeviceInfoModel.create({ customerId: customer._id, deviceId, deviceToken });
        }

        await ensureManychatSubscriber(shopConfig, customer);
        return {
          customer,
          token: TokenHelper.getCustomerToken(customer),
        };
      },
    },
  },
};

async function ensureManychatSubscriber(shopConfig: IShopConfig, customer: ICustomer) {
  try {
    if (shopConfig.manychatConfig?.active && shopConfig.manychatConfig?.status == "connected") {
      const {
        manychatConfig: { apiKey, mappingField },
      } = shopConfig;
      // Kích hoạt manychat và đã kết nối manychat
      if (_.isEmpty(customer.manychatSubscriber?.id) == true) {
        // Tài khoản chưa két nối manychat
        const loginPhoneField = await getManychatLoginPhoneField(apiKey, mappingField);
        logger.info("loginPhoneField", { loginPhoneField });
        let subscribers = await manychat
          .findSubscriberByCustomField(apiKey, loginPhoneField.id, customer.phone)
          .catch((err) => []);
        if (subscribers.length > 0) {
          // Tạo subscriber thành công. cập nhật vào khách hàng
          customer.manychatSubscriber = subscribers[0];
          await customer.save();
        }
      }
    }
  } catch (err) {
    logger.error(`Lỗi khi kết nối manychat`, err);
  }
}

async function getManychatLoginPhoneField(
  apiKey: string,
  mappingField: string = "3MSHOP_LOGIN_PHONE"
) {
  const key = `manychat:${apiKey}:loginPhoneFieldId`;
  let result = JSON.parse(await cache.get(key));
  if (_.isEmpty(result) == false) return result;

  // Láy danh sách field từ Page
  const customFields = await manychat.getPageCustomFields(apiKey);
  let loginPhoneField = customFields.find((f: any) => f.name == mappingField);
  if (_.isEmpty(loginPhoneField) == true) {
    // Chưa có field login phone, tạo mới
    logger.info(`Tạo custom field cho manychat`);
    loginPhoneField = await manychat.createPageCustomField(apiKey, {
      caption: mappingField || "3MSHOP_LOGIN_PHONE",
      type: "text",
      description: "Số điện thoại đăng nhập cửa hàng",
    });
  }

  await cache.set(key, JSON.stringify(loginPhoneField), 60 * 60); // cache trong  1 tiếng
  return loginPhoneField;
}
