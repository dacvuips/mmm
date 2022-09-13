import _ from "lodash";
import { UtilsHelper } from "../../../../helpers";
import manychat from "../../../../helpers/manychat";
import { logger } from "../../../../loaders/logger";
import LocalBroker from "../../../../services/broker";
import { CustomerLoader } from "../../customer/customer.model";
import { IShopConfig } from "../../shop/shopConfig/shopConfig.model";
import { TriggerActionModule } from "./common";

export default {
  type: "manychat",
  handler: async (options = {}, context = {}) => {
    const { buyerId } = context;

    if (!buyerId) return;

    const customer = await CustomerLoader.load(buyerId);

    if (_.isEmpty(customer.manychatSubscriber?.id) == false) {
      // Có liên kết manychat
      const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
        id: customer.memberId.toString(),
      });

      const {
        manychatConfig: { active, pageInfo, apiKey, status },
      } = shopConfig;
      if (active == false || status == "disconnected") {
        // Chưa kích hoạt hoặc chưa két nội manychat, bỏ qua
        return;
      }
      if (pageInfo.id.toString() != customer.manychatSubscriber.page_id.toString()) {
        // Không cùng page, bỏ qua
        return;
      }
      const {
        manychatSubscriber: { id: subscriberId },
      } = customer;
      const parsedOptions = UtilsHelper.parseObjectWithInfo({ object: options, info: context });
      const { text } = parsedOptions;
      const sendData = manychat.sendDataBuilder
        .subscriber(subscriberId)
        .messages([manychat.messageBuilder.message(text).build()])
        .build();
      await manychat.send(apiKey, sendData);
    }
  },
} as TriggerActionModule;
