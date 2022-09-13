import axios from "axios";
import { UtilsHelper } from "../../../../helpers";
import { logger } from "../../../../loaders/logger";
import { CustomerLoader } from "../../customer/customer.model";
import { TriggerActionModule } from "./common";

export default {
  type: "smaxbot",
  handler: async (options = {}, context = {}) => {
    try {
      const { buyerId } = context;

      const customer = await CustomerLoader.load(buyerId);

      if (!customer) return;

      const parsedOptions = UtilsHelper.parseObjectWithInfo({ object: options, info: context });
      const { type, botId, botToken, blockId, messagingTag, text, attr = [] } = parsedOptions;

      const body: any = {
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_fbid: customer.psid,
        messaging_tag: messagingTag,
        priority: ["fbid", "phone", "email"],
        ...(type == "block" ? { block_id: blockId } : { messages: [{ text }] }),
      };

      // if attr is not empty, then parse key & value to body
      if (attr.length > 0) {
        attr.forEach(({ key, value }: any) => {
          body[key] = value;
        });
      }

      await axios.post(`https://api.smax.bot/public/bots/${botId}/send`, body, {
        headers: { Authorization: "Bearer " + botToken },
      });
    } catch (err) {
      logger.error(`Lỗi khi xử lý action smaxbot`, err);
    }
  },
} as TriggerActionModule;
