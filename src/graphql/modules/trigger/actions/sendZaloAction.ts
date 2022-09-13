import { UtilsHelper } from "../../../../helpers";
import zalo from "../../../../helpers/zalo";
import { ZaloMessageBuilder } from "../../../../helpers/zalo/zaloMessageBuilder";
import { logger } from "../../../../loaders/logger";
import LocalBroker from "../../../../services/broker";
import { CustomerLoader } from "../../customer/customer.model";
import { IShopConfig } from "../../shop/shopConfig/shopConfig.model";
import { getZaloToken } from "../../shop/shopConfig/zalo/common";
import { ZaloConfigStatus } from "../../shop/shopConfig/zalo/zaloConfig.graphql";
import { TriggerActionModule } from "./common";

export default {
  type: "zalo",
  handler: async (options = {}, context = {}) => {
    const { sellerId, buyerId } = context;

    if (!sellerId || !buyerId) return;
    const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
      id: sellerId.toString(),
    });
    const {
      zaloConfig: { active, status },
    } = shopConfig;
    if (active == false || status == ZaloConfigStatus.disconnect) {
      // Chưa kích hoạt hoặc chưa két nội manychat, bỏ qua
      return;
    }
    try {
      const customer = await CustomerLoader.load(buyerId);
      const { followerId } = customer;
      const token = await getZaloToken(shopConfig);
      const parsedOptions = UtilsHelper.parseObjectWithInfo({ object: options, info: context });
      const { text } = parsedOptions;
      const sendData = new ZaloMessageBuilder().text(text).send(followerId);
      await zalo.message(token, sendData);
    } catch (err) {
      logger.error(`lỗi khi gửi tin zalo`, err);
    }
  },
} as TriggerActionModule;
